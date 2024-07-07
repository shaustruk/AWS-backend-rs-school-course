import { S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as csv from 'csv-parser';

// Initialize S3 client for interacting with S3 service
const s3 = new S3Client({ region: 'us-east-1' });

export const handler: S3Handler = async (event) => {
    for (const record of event.Records) {
        const { bucket, object } = record.s3;
        const sourceKey = object.key;
        const parsedKey = sourceKey.replace('uploaded/', 'parsed/');
        const params = {
            Bucket: bucket.name,
            Key: sourceKey,
        };

        try {
            // Get the object from S3
            const getCommand = new GetObjectCommand(params);
            const { Body } = await s3.send(getCommand);

            // Convert Body to Readable stream
            const stream = Body as Readable;

            // Process the CSV file
            await new Promise<void>((resolve, reject) => {
                stream.pipe(csv())
                    .on('data', (data) => {
                        console.log('Parsed record:', data);
                    })
                    .on('end', () => {
                        console.log('Parsing completed.');
                        resolve();
                    })
                    .on('error', (error) => {
                        console.error('Error parsing CSV:', error);
                        reject(error);
                    });
            });

            // Move the object to the parsed folder and delete the original
            const copyCommand = new CopyObjectCommand({
                Bucket: bucket.name,
                CopySource: `${bucket.name}/${sourceKey}`,
                Key: parsedKey,
            });
            await s3.send(copyCommand);

            const deleteCommand = new DeleteObjectCommand(params);
            await s3.send(deleteCommand);

            console.log('CSV moved from "uploaded" to "parsed" directory and removed in "uploaded"');

        } catch (error) {
            console.error(`Error processing ${object.key} from ${bucket.name}`, error);
        }
    }
};
