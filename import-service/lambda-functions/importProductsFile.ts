import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({ signatureVersion: 'v4' });

export const handler: APIGatewayProxyHandler = async (event) => {
    const bucketName = 'ImportServiceBucket';
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing name query parameter' }),
        };
    }

    const signedUrlExpireSeconds = 60 * 5;
    const url = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: `uploaded/${fileName}`,
        Expires: signedUrlExpireSeconds,
        ContentType: 'text/csv'
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ url }),
    };
};
