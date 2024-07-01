import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'us-east-1' }); // Specify your region

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key,X-Amz-Date,X-Amz-Security-Token",
};

export const handler: APIGatewayProxyHandler = async (event) => {
    const bucketName = process.env.BUCKET_NAME;  // Use environment variable for bucket name
    const fileName = event.queryStringParameters?.name;

    console.log('cutrent file:', fileName);

    console.log('bucket', bucketName);

    if (!bucketName) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Bucket name is not configured properly' }),
        };
    }

    if (!fileName) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Missing name query parameter' }),
        };
    }

    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: `uploaded/${fileName}`,
            ContentType: 'text/csv'
        });

        const url = await getSignedUrl(s3Client, command); 

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ url }),
        };
    } catch (error: any) {
        console.error('Error generating signed URL:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Error generating signed URL', error: error.message }),
        };
    }
};
