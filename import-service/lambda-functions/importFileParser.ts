import { S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as csv from "csv-parser";

// Initialize S3 client for interacting with S3 service
const s3 = new S3Client({ region: 'eu-west-1' });

// Define Lambda function handler
export const handler: S3Handler = async (event) => {
    // Loop through all records in the event
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
            const copyCommand = new CopyObjectCommand({
                Bucket: bucket.name,
                CopySource: `${bucket.name}/${sourceKey}`,
                Key: parsedKey,
            });
          
            const deleteCommand = new DeleteObjectCommand(params);
        
            const { Body } = await s3.send(getCommand);            
            // Convert Body to Readable stream
            const stream = Body as Readable;
            // Parse CSV
            stream.pipe(csv())
                .on('data', (data) => console.log('Parsed record:', data))
                .on('end', () => console.log('Parsing completed.'));

            // Copy and delete the original file
            await s3.send(copyCommand);
            await s3.send(deleteCommand);
            console.log('CSV moved from "uploaded" to "parsed" directory and removed in "uploaded"');
                
        } catch (error) {
            console.error(`Error processing ${object.key} from ${bucket.name}`, error);
        }
    }
};
