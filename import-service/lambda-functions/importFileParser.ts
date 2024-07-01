import { S3Handler } from 'aws-lambda';
import { S3 } from '@aws-sdk/client-s3';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

const s3 = new S3({});

export const handler: S3Handler = async (event) => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;

    try {
        const s3Object = await s3.getObject({ Bucket: bucket, Key: key });
        const s3Stream = s3Object.Body as Readable;

        s3Stream
            .pipe(csvParser())
            .on('data', (data) => {
                console.log('Parsed record:', data);
            })
            .on('end', () => {
                console.log('CSV parsing completed.');
            })
            .on('error', (error) => {
                console.error('Error parsing CSV:', error);
            });
    } catch (error) {
        console.error('Error processing S3 event:', error);
    }
};
