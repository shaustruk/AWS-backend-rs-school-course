import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

//db
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = 'products';
const STOCKS_TABLE_NAME = 'stocks';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {  

  const productId = event.pathParameters?.productId;
console.log(`id: ${productId}`);

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Product ID is required' }),
    };
  }

  try {
   
    const productData = await dynamodb.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE_NAME,
        Key: { productId },
      })
    );
    const product = productData.Item;

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    const stockData = await dynamodb.send(
      new GetCommand({
        TableName: STOCKS_TABLE_NAME,
        Key: {
          product_id: productId
      }
      })
    );
 
    const stockProduct = stockData.Item;
    if (!stockProduct) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }
    const result = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      count: stockProduct ? stockProduct.count : 0,
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
