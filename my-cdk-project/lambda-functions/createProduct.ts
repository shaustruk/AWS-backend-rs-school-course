import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = 'products';
const STOCKS_TABLE_NAME = 'stocks';

if (!PRODUCTS_TABLE_NAME || !STOCKS_TABLE_NAME) {
  throw new Error("Environment variables PRODUCTS_TABLE_NAME and STOCKS_TABLE_NAME must be defined");
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    console.log('Body:', body);

    // Validate required fields
    if (!body.title || !body.price || body.count === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Title, price, and count are required" }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "POST",
        },
      };
    }

    // Generate unique IDs
    const productId = randomUUID();
    const stockId = randomUUID();

    // Prepare the product and stock items
    const productItem = {
      id: productId,
      title: body.title,
      description: body.description || '',
      price: body.price
    };

    const stockItem = {
      product_id: productItem.id,
      count: body.count
    };

    console.log('Product:', productItem);
    console.log('Stock:', stockItem);

    // Define the transaction parameters
    const transactParams = {
      TransactItems: [
        {
          Put: {
            TableName: PRODUCTS_TABLE_NAME,
            Item: productItem,
            ConditionExpression: 'attribute_not_exists(id)' // Ensure product does not already exist
          }
        },
        {
          Put: {
            TableName: STOCKS_TABLE_NAME,
            Item: stockItem,
            ConditionExpression: 'attribute_not_exists(id)' // Ensure stock does not already exist
          }
        }
      ]
    };

    // Execute the transaction
    await dynamodb.send(new TransactWriteCommand(transactParams));

    // Return success response
    const response = {
      id: productId,
      title: productItem.title,
      description: productItem.description,
      price: productItem.price,
      count: stockItem.count
    };

    return {
      statusCode: 201,
      body: JSON.stringify(response),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "POST",
      },
    };
  } catch (error) {
    console.error('Failed to add product and stock:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to add product and stock', error }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "POST",
      },
    };
  }
};

function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
