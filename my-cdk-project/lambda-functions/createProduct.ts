import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = 'products';
const STOCKS_TABLE_NAME = 'stocks';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const requestBody = JSON.parse(event.body || '{}');

    if (!requestBody) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "POST",
        },
        body: JSON.stringify({ message: 'Invalid product data' }),
      };
    }
//items
    const newProduct = {
      id: uuidv4(),
      title: requestBody.title,
      description: requestBody.description || '',
      price: requestBody.price
    };

    const stock = {
      product_id: requestBody.id,
      count: requestBody.count
    };
//tables
 const paramsProduct = {
      TableName: PRODUCTS_TABLE_NAME,
      Item: newProduct
    };

    const paramsStock = {
      TableName: STOCKS_TABLE_NAME,
      Item: stock
    };
    const productPutCommand = new PutCommand(paramsProduct);
    const stockPutCommand = new PutCommand(paramsStock);

    await dynamodb.send(productPutCommand);
    await dynamodb.send(stockPutCommand);

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
