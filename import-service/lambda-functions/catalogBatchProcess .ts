import { SQSHandler, SQSEvent, SQSRecord } from 'aws-lambda';

export async function catalogBatchProcess(event: SQSEvent) {
    try {
        for (const record of event.Records) {
            // Process each record here
            console.log('Processing record:', record);

            // Simulate processing or other logic
            await simulateProcessing(record);

            // You can implement your business logic here to create products in the products table
            // Example response
            const response = {
                statusCode: 200,
                body: 'Processed successfully',
            };

            console.log('Processed record:', record);
        }

        // Return success response if needed
        return {
            statusCode: 200,
            body: 'Batch processed successfully',
        };
    } catch (error) {
        console.error('Error processing batch:', error);

        // Return error response if needed
        return {
            statusCode: 500,
            body: 'Error processing batch',
        };
    }
}

async function simulateProcessing(record: SQSRecord) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
}
