import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

export function sqsHandler(context:any)
{
    function setup()
    {
        return {
            clean_up_deleted_files_queue: context.env.CLEANUP_DELETE_FILES
        }
    }

    function connect()
    {
        return new SQSClient({
            region: process.env.SQS_DEFAULT_REGION || "eu-west-1", // MUST BE eu-west-1
            endpoint: process.env.SQS_ENDPOINT || "http://localhost:4566",
            credentials: {
                accessKeyId: process.env.SQS_KEY_ID || "test",
                secretAccessKey: process.env.SQS_SECRET_ACCESS_KEY || "test",
            },
        });
    }

    async function publish(queueName: any, message: any)
    {
        let queueUrl = 'http://localhost.localstack.cloud:4566/000000000000/clean-up-delete-files.fifo';//context.queue.url[queueName];
        // queueUrl = 'http://localhost:4566/000000000000/clean-up-delete-files.fifo';
        // console.log(`Queue Url: `, !queueUrl, queueName, queueUrl, context.queue.url);
        if (!queueUrl) {
            // throw new Error(`Queue "${queueName}" not configured`);
            return {
                status : 'failed',
                message : 'queue not found'
            };
        }


        try {

            const command = new SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify(message),
                MessageGroupId: 'default'
            });
            console.log('test');
            const response = await context.queue.connect.send(command);
            console.log(`[${queueName}] Message sent: ${response.MessageId}`);
            return {
                status : 'success',
                data : {
                    message: response
                }
            };

        } catch (error:any) {

            console.error(error);

            return {
                status : 'failed',
                message : 'queue not found'
            };

        }
    }

    async function publishBatch(queueName: any, messages: any[])
    {
        const results = [];
        for (const message of messages) {
            const id = await publish(queueName, message);
            results.push(id);
        }
        return results;
    }

    async function publishDelayed(queueName: any, message: any, delaySeconds: number)
    {
        const queueUrl = context.queue.url[queueName];

        if (!queueUrl) {
            throw new Error(`Queue "${queueName}" not configured`);
        }

        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
            DelaySeconds: delaySeconds
        });

        const response = await context.queue.connect.send(command);
        console.log(`[${queueName}] Message scheduled with ${delaySeconds}s delay: ${response.MessageId}`);
        return response.MessageId;

    }

    async function receive(queueName:any)
    {
        const queueUrl = context.queue.url[queueName];

        const command = await context.queue.connect.receiveMessage({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20
        });

        const response = await context.queue.connect.send(command);
        return response.Messages || [];

    }

    async function deleteMessage(queueName: any, receiptHandle: string)
    {
        const queueUrl = context.queue.url[queueName];

        const command = new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle
        });

        await context.queue.connect.send(command);
        console.log(`[${queueName}] Message deleted`);
    }

    async function processMessage(queueName:any, message: any)
    {
        try {
            const body = JSON.parse(message.Body);

            console.log(`[${queueName}] Processing:`, body);

            return body;

        } catch (error) {

            console.error(`[${queueName}] Failed to parse message:`, error);
            throw error;

        }

    }

    async function consume(
        queueName: any,
        handler: (message: any) => Promise<void>,
        options?: {
            maxMessages?: number;
            pollInterval?: number;
            shouldDeleteOnSuccess?: boolean;
        }
    )
    {
        const {
            maxMessages = 10,
            pollInterval = 1000,
            shouldDeleteOnSuccess = true
        } = options || {};

        const queueUrl = context.queue.url[queueName];

        console.log(`Consumer started for ${queueName}`);

        while (true) {
            try {
                // Receive messages
                const command = new ReceiveMessageCommand({
                    QueueUrl: queueUrl,
                    MaxNumberOfMessages: maxMessages,
                    WaitTimeSeconds: 20,
                    VisibilityTimeout: 30
                });

                const response = await context.queue.connect.send(command);
                const messages = response.Messages || [];

                if (messages.length === 0) {
                    await sleep(pollInterval);
                    continue;
                }

                console.log(`[${queueName}] Received ${messages.length} messages`);

                // Process each message
                for (const message of messages) {
                    try {
                        const body = JSON.parse(message.Body);
                        await handler(body);

                        if (shouldDeleteOnSuccess) {
                            await deleteMessage(queueName, message.ReceiptHandle);
                        }

                        console.log(`[${queueName}] Message processed: ${message.MessageId}`);

                    } catch (error) {
                        console.error(`[${queueName}] Failed to process message ${message.MessageId}:`, error);
                        // Don't delete - will retry after visibility timeout
                    }
                }

            } catch (error) {
                console.error(`[${queueName}] Consumer error:`, error);
                await sleep(pollInterval);
            }
        }
    }


    async function consumeOnce(
        queueName: any,
        handler: (message: any) => Promise<void>
    )
    {
        const messages = await receive(queueName);

        for (const message of messages) {
            try {
                const body = JSON.parse(message.Body);
                await handler(body);
                await deleteMessage(queueName, message.ReceiptHandle);
                console.log(`[${queueName}] Message processed: ${message.MessageId}`);
            } catch (error) {
                console.error(`[${queueName}] Failed:`, error);
            }
        }

        return messages.length;
    }

    async function testPublish()
    {
        // Send a message
        await context.queue.publish('order', {
            orderId: 12345,
            userId: 678,
            items: ['item1', 'item2']
        });

        // Send with delay
        await context.queue.publishDelayed('email', {
            to: 'user@example.com',
            subject: 'Reminder'
        }, 3600); // 60 minutes delay

        // Send multiple messages
        await context.queue.publishBatch('notification', [
            { userId: 1, message: 'Hello' },
            { userId: 2, message: 'World' }
        ]);
    }

    async function testConsumer()
    {
        // Send a message
        await context.queue.consume('order',
            async (message:any) => {
            // Your business logic here
            console.log('Processing order:', message);

            // Simulate work
            await new Promise(resolve => setTimeout(resolve, 1000));
        });

        // Send with delay
        await context.queue.publishDelayed('email', {
            to: 'user@example.com',
            subject: 'Reminder'
        }, 3600); // 60 minutes delay

        // Send multiple messages
        await context.queue.publishBatch('notification', [
            { userId: 1, message: 'Hello' },
            { userId: 2, message: 'World' }
        ]);
    }

    function sleep(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    return {
        url : setup(),
        connect : connect(),
        publish,
        publishBatch,
        publishDelayed,
        processMessage,
        consume,
        consumeOnce,
        testPublish,
        testConsumer

    };
}


export function sqsTest(context:any)
{

    async function sqsSendMessage()
    {
        await context.queue.publish('order', {
            orderId: 12345,
            userId: 678,
            items: ['item1', 'item2']
        });

        await context.queue.publishDelayed('email', {
            to: 'user@example.com',
            subject: 'Reminder'
        }, 3600);


        await context.queue.publishBatch('notification', [
            { userId: 1, message: 'Hello' },
            { userId: 2, message: 'World' }
        ]);
    }



    async function sqsConsume()
    {
        await context.queue.consume('order', async (message:any) => {

            // business logic goes on
            console.log('Processing order:', message);

            // Simulate work
            await new Promise(resolve => setTimeout(resolve, 1000));

            // If this throws, message goes back to queue (retry)
            // If it succeeds, message is auto-deleted
        });
    }
}

