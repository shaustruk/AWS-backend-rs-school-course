import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from "uuid";

const dynamoDb = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME = 'products';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { title, description, price } = JSON.parse(event.body || '{}');

    if (!title || !price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid product data' }),
      };
    }

    const id = uuidv4();
    const newProduct = { id, title, description, price };

    await dynamoDb.put({
      TableName: PRODUCTS_TABLE_NAME,
      Item: newProduct,
    }).promise();

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
