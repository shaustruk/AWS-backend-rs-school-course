import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'us-east-1' });

const headers =  {
    "Access-Control-Allow-Origin": "*",            
    "Access-Control-Allow-Methods": "*",
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  },

export const handler: APIGatewayProxyHandler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight' }),
        };
    }

    const bucketName = 'ImportServiceBucket';
    const fileName = event.queryStringParameters?.name;

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
