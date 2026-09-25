// examples/redis/05-queues/job-queue.ts
export function jobQueueExample(context: any) {
    const { redis } = context;

    const QUEUE_KEY = 'jobs';
    const PROCESSING_KEY = 'jobs:processing';
    const FAILED_KEY = 'jobs:failed';

    // ============ ADD JOB ============
    async function addJob(jobType: string, data: any, priority: number = 0) {
        const jobId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const job = {
            id: jobId,
            type: jobType,
            data,
            priority,
            createdAt: new Date().toISOString(),
            attempts: 0
        };

        await redis.zadd(QUEUE_KEY, priority, JSON.stringify(job));
        console.log(`📥 Job added: ${jobId} (${jobType})`);
        return jobId;
    }

    // ============ PROCESS JOB ============
    async function processJob(handler: (job: any) => Promise<any>) {
        // Get highest priority job
        const jobs = await redis.zrange(QUEUE_KEY, 0, 0);
        if (jobs.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return null;
        }

        const jobData = jobs[0];
        const job = JSON.parse(jobData);

        // Remove from queue
        await redis.zrem(QUEUE_KEY, jobData);

        // Mark as processing
        await redis.hset(PROCESSING_KEY, job.id, JSON.stringify({
            ...job,
            startedAt: new Date().toISOString()
        }));

        try {
            // Process the job
            console.log(`⚙️ Processing job: ${job.id}`);
            const result = await handler(job);

            // Remove from processing
            await redis.hdel(PROCESSING_KEY, job.id);
            console.log(`✅ Job completed: ${job.id}`);

            return result;
        } catch (error: any) {
            // Handle failure
            job.attempts += 1;

            if (job.attempts < 3) {
                // Retry - add back to queue with lower priority
                const retryPriority = job.priority + 10;
                await redis.zadd(QUEUE_KEY, retryPriority, JSON.stringify(job));
                console.log(`🔄 Job retry ${job.attempts}: ${job.id}`);
            } else {
                // Move to failed queue
                await redis.hset(FAILED_KEY, job.id, JSON.stringify({
                    ...job,
                    error: error.message,
                    failedAt: new Date().toISOString()
                }));
                await redis.hdel(PROCESSING_KEY, job.id);
                console.log(`💀 Job failed: ${job.id}`);
            }

            throw error;
        }
    }

    // ============ GET QUEUE STATUS ============
    async function getQueueStatus() {
        const pending = await redis.client.zCard(QUEUE_KEY);
        const processing = await redis.hlen(PROCESSING_KEY);
        const failed = await redis.hlen(FAILED_KEY);

        return {
            pending,
            processing,
            failed,
            total: pending + processing + failed
        };
    }

    // ============ RETRY FAILED JOB ============
    async function retryFailedJob(jobId: string) {
        const jobData = await redis.hget(FAILED_KEY, jobId);
        if (!jobData) return null;

        const job = JSON.parse(jobData);
        job.attempts = 0;

        await redis.hdel(FAILED_KEY, jobId);
        await redis.zadd(QUEUE_KEY, job.priority || 0, JSON.stringify(job));

        console.log(`🔄 Retrying failed job: ${jobId}`);
        return job;
    }

    return {
        addJob,
        processJob,
        getQueueStatus,
        retryFailedJob
    };
}