import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { IProduct } from './productInterface';

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
   
    const productsScan = new GetCommand({
      TableName: PRODUCTS_TABLE_NAME,
      Key: { id: productId }
    });
    const productsResponse = await dynamodb.send(productsScan);
    

    const product: IProduct = productsResponse.Item as IProduct;

    console.log('Product:', productsResponse);

    const stockResult = await dynamodb.send(
      new GetCommand({
          TableName: STOCKS_TABLE_NAME,
          Key: {
              product_id: productId
          }
      })  
  )
  const stock = stockResult.Item as IProduct;

  const result = {
    ...product,
    count: stock?.count || 0
}

  if (product) {
    const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stock)
    };
    return response;
} else {
    const response = {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Product not found" })
    }
    return response;
}   
} catch (error) {
console.error("Error....", error);
 return {
    statusCode: 500,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Internal Server Error" })
};
}
};
