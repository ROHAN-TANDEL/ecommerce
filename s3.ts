// context/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

export function s3Handler(context:any) {
    // S3 Client for LocalStack
    function connect() {
        return new S3Client({
            endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
            },
            forcePathStyle: true  // Required for LocalStack
        });
    }

    const bucketName = process.env.AWS_BUCKET || 'my-bucket';
    const client = connect();

    // ============ 1. UPLOAD ============
    async function uploadFile(file:any, key:any, options:any = {})
    {
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: file.buffer || fs.createReadStream(file.path),
                ContentType: file.mimetype || options.contentType,
                Metadata: options.metadata || {}
            });

            const response = await client.send(command);

            console.log(`Uploaded: ${key}`);
            return {
                success: true,
                key: key,
                etag: response.ETag,
                location: `https://${bucketName}.s3.amazonaws.com/${key}`
            };

        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    }

    // Upload from buffer (memory)
    async function uploadBuffer(buffer:any, key:any, contentType = 'application/octet-stream') {
        return await uploadFile({ buffer, mimetype: contentType }, key);
    }

    // Upload from file path
    async function uploadFromPath(filePath:any, key:any, contentType = null) {
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = contentType || getMimeType(filePath);
        return await uploadFile({ buffer: fileBuffer, mimetype: mimeType }, key);
    }

    // ============ 2. DOWNLOAD ============
    async function downloadFile(key:any) {
        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key
            });

            const response :any  = await client.send(command);

            // Convert stream to buffer
            const chunks = [];
            for await (const chunk of response.Body) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            return {
                success: true,
                key: key,
                buffer: buffer,
                contentType: response.ContentType,
                contentLength: response.ContentLength,
                metadata: response.Metadata
            };

        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    }

    // Download and save to file
    async function downloadToFile(key:any, outputPath:any) {
        const result = await downloadFile(key);
        fs.writeFileSync(outputPath, result.buffer);
        return {
            success: true,
            key: key,
            savedPath: outputPath
        };
    }

    // ============ 3. DELETE ============
    async function deleteFile(key:any) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key
            });

            const response:any = await client.send(command);

            console.log(`Deleted: ${key}`);
            return {
                success: true,
                key: key,
                deleteMarker: response.DeleteMarker
            };

        } catch (error) {
            console.error('Delete failed:', error);
            throw error;
        }
    }

    // ============ 4. LIST (CRUD - Read) ============
    async function listFiles(prefix = '', maxKeys = 100) {
        try {
            const command = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys
            });

            const response = await client.send(command);

            const files = (response.Contents || []).map(file => ({
                key: file.Key,
                size: file.Size,
                lastModified: file.LastModified,
                etag: file.ETag
            }));

            return {
                success: true,
                files: files,
                count: files.length,
                isTruncated: response.IsTruncated
            };

        } catch (error) {
            console.error('List failed:', error);
            throw error;
        }
    }

    // ============ 5. TEMPORARY ACCESS (Presigned URLs) ============
    async function getPresignedUploadUrl(key:any, expiresIn = 3600) {
        try {
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key
            });

            const url = await getSignedUrl(client, command, { expiresIn });

            return {
                success: true,
                url: url,
                key: key,
                expiresIn: expiresIn,
                expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
            };

        } catch (error) {
            console.error('Presigned URL generation failed:', error);
            throw error;
        }
    }

    async function getPresignedDownloadUrl(key:any, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: key
            });

            const url = await getSignedUrl(client, command, { expiresIn });

            return {
                success: true,
                url: url,
                key: key,
                expiresIn: expiresIn,
                expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
            };

        } catch (error) {
            console.error('Presigned URL generation failed:', error);
            throw error;
        }
    }

    // ============ 6. HELPER FUNCTIONS ============
    function getMimeType(filePath:any) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes:any = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.json': 'application/json',
            '.csv': 'text/csv',
            '.zip': 'application/zip'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    function generateKey(originalName:any, userId:any) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);
        return `uploads/${userId}/${name}-${timestamp}-${random}${ext}`;
    }

    // ============ 7. BULK OPERATIONS ============
    async function uploadMultiple(files:any, userId:any) {
        const results = [];
        for (const file of files) {
            try {
                const key = generateKey(file.originalname, userId);
                const result = await uploadFile(file, key);
                results.push({ ...result, originalName: file.originalname });
            } catch (error:any) {
                results.push({
                    success: false,
                    originalName: file.originalname,
                    error: error.message
                });
            }
        }
        return results;
    }

    async function deleteMultiple(keys:any) {
        const results = [];
        for (const key of keys) {
            try {
                const result = await deleteFile(key);
                results.push(result);
            } catch (error:any) {
                results.push({
                    success: false,
                    key: key,
                    error: error.message
                });
            }
        }
        return results;
    }

    // ============ PUBLIC API ============
    return {
        // Core operations
        uploadFile,
        uploadBuffer,
        uploadFromPath,
        downloadFile,
        downloadToFile,
        deleteFile,
        listFiles,

        // Presigned URLs
        getPresignedUploadUrl,
        getPresignedDownloadUrl,

        // Bulk operations
        uploadMultiple,
        deleteMultiple,

        // Helpers
        generateKey,
        getMimeType,
        connect,
        client
    };
}