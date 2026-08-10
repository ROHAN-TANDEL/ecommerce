// context/cdn.js
import { CloudFrontClient, CreateDistributionCommand, GetDistributionCommand, ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import { S3Client, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

export function cdnHandler(context:any) {
    const s3 = context.s3;
    const bucketName = process.env.S3_BUCKET || 'my-bucket';

    // CloudFront Client
    function connectCloudFront() {
        return new CloudFrontClient({
            endpoint: process.env.CLOUDFRONT_ENDPOINT || 'http://localhost:4571',
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
            }
        });
    }

    // ============ 1. CREATE CDN DISTRIBUTION ============
    async function createDistribution() {
        const cloudfront = connectCloudFront();

        // Get S3 bucket region and domain
        const bucketDomain = `${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;

        const command = new CreateDistributionCommand({
            DistributionConfig: {
                CallerReference: `cdn-${Date.now()}`,
                Origins: {
                    Quantity: 1,
                    Items: [{
                        Id: 's3-origin',
                        DomainName: bucketDomain,
                        OriginPath: '',
                        CustomOriginConfig: {
                            HTTPPort: 80,
                            HTTPSPort: 443,
                            OriginProtocolPolicy: 'http-only'
                        }
                    }]
                },
                DefaultCacheBehavior: {
                    TargetOriginId: 's3-origin',
                    CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
                    ViewerProtocolPolicy: 'allow-all',
                    MinTTL: 0,
                    DefaultTTL: 86400,
                    MaxTTL: 31536000
                },
                Enabled: true,
                Comment: 'CDN for file storage',
                PriceClass: 'PriceClass_All'
            }
        });

        try {
            const response:any = await cloudfront.send(command);
            const distribution:any = response.Distribution;

            console.log('CloudFront distribution created:', distribution.DomainName);
            console.log('Distribution ID:', distribution.Id);

            return {
                success: true,
                distributionId: distribution.Id,
                domainName: distribution.DomainName,
                status: distribution.Status
            };

        } catch (error:any) {
            console.error('Failed to create distribution:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============ 2. GET CDN URL ============
    function getCDNUrl(key:any, customDomain = null) {
        const cdnDomain = process.env.CDN_DOMAIN || 'localhost:4571';
        const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;

        if (customDomain) {
            return `https://${customDomain}/${key}`;
        }

        // For LocalStack, use the distribution domain
        if (distributionId) {
            return `https://${distributionId}.cloudfront.localstack.cloud/${key}`;
        }

        // Fallback: Use S3 URL with CDN path
        return `https://${cdnDomain}/${key}`;
    }

    // ============ 3. SET S3 BUCKET POLICY ============
    async function makeBucketPublic() {
        try {
            const policy = {
                Version: '2012-10-17',
                Statement: [{
                    Sid: 'PublicReadGetObject',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: 's3:GetObject',
                    Resource: `arn:aws:s3:::${bucketName}/*`
                }]
            };

            const command = new PutBucketPolicyCommand({
                Bucket: bucketName,
                Policy: JSON.stringify(policy)
            });

            await s3.client.send(command);
            console.log('S3 bucket public policy applied');

            return { success: true };

        } catch (error:any) {
            console.error('Failed to set bucket policy:', error);
            return { success: false, error: error.message };
        }
    }

    // ============ 4. GET DISTRIBUTION INFO ============
    async function getDistribution(distributionId:any) {
        const cloudfront = connectCloudFront();

        try {
            const command = new GetDistributionCommand({
                Id: distributionId
            });
            const response = await cloudfront.send(command);

            return {
                success: true,
                distribution: response.Distribution
            };

        } catch (error:any) {
            console.error('Failed to get distribution:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============ 5. LIST DISTRIBUTIONS ============
    async function listDistributions() {
        const cloudfront = connectCloudFront();

        try {
            const command = new ListDistributionsCommand({});
            const response = await cloudfront.send(command);

            return {
                success: true,
                distributions: response.DistributionList?.Items || []
            };

        } catch (error:any) {
            console.error('Failed to list distributions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============ 6. GET FILE WITH CDN URL ============
    async function getFileUrl(fileKey:any, options = {}) {
        const { customDomain, expiresIn }:any = options;

        // If using CDN (public files), return CDN URL
        if (process.env.USE_CDN === 'true' || customDomain) {
            const cdnUrl = getCDNUrl(fileKey, customDomain);
            return {
                url: cdnUrl,
                source: 'cdn',
                expiresAt: null // CDN URLs are permanent (or cache-controlled)
            };
        }

        // Fallback: Use presigned URL (for private files)
        const presigned = await context.s3.getPresignedDownloadUrl(fileKey, expiresIn || 3600);
        return {
            url: presigned.url,
            source: 's3-presigned',
            expiresAt: presigned.expiresAt
        };
    }

    // ============ 7. PUBLIC API ============
    return {
        connectCloudFront,
        createDistribution,
        getDistribution,
        listDistributions,
        makeBucketPublic,
        getCDNUrl,
        getFileUrl
    };
}