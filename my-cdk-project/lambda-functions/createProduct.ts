import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { IProduct } from "./productInterface";

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = 'products';
const STOCKS_TABLE_NAME = 'stocks';


if (!PRODUCTS_TABLE_NAME || !STOCKS_TABLE_NAME) {
  throw new Error("Environment variables PRODUCTS_TABLE_NAME and STOCKS_TABLE_NAME must be defined");
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body!);  
  try {
    // Парсинг тела запроса    
    const body = JSON.parse(event.body!);
    console.log('body:', body);
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

    const product = {
      id:randomUUID(),
      title: body.title,
      description: body.description || '',
      price: body.price
    };

    const stock = {
      product_id: product.id,
      count: body.count
    };

    console.log(product, stock);

    const paramsProduct = {
      TableName: PRODUCTS_TABLE_NAME,
      Item: product
    };

    const paramsStock = {
      TableName: STOCKS_TABLE_NAME,
      Item: stock
    };

    const productResponce:IProduct = {
      id: product.id,
      title: product.price,
      description: product.description, 
      price: product.price,
      count: stock.count,
     
    };

    const productPutCommand = new PutCommand(paramsProduct);
    const stockPutCommand = new PutCommand(paramsStock);

    await dynamodb.send(productPutCommand);
    await dynamodb.send(stockPutCommand);

    return {
      statusCode: 201,
      body: JSON.stringify(productResponce),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "POST",
      },
    };
  } catch (error) {
    console.error('Failed to add product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to add product' }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "POST",
      },
    };
  }

  function randomUUID(): string {
  
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }


};