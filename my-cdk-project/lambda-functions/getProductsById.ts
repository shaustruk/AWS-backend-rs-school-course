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


  try {
   
  const productId = event.pathParameters!.productId;
  console.log(`id: ${productId}`);

    const productsScan = new GetCommand({
      TableName: PRODUCTS_TABLE_NAME,
      Key: { id: productId }
    });

    const stockScan = new GetCommand({
      TableName: STOCKS_TABLE_NAME,
      Key: {
        product_id: productId,
      },
    });
  
    const productsResponse = await dynamodb.send(productsScan);
    const product: IProduct = productsResponse.Item as IProduct;

    console.log('Product:', productsResponse);
 
    const stockResponse = await dynamodb.send(stockScan);
    const stockItem: IProduct = stockResponse.Item as IProduct;

  const result = {
    ...product,
    count: stockItem.count || 0
  }
    console.log('Result:', result)


  if (result) {
    const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result)
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
