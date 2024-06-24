import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME = 'products';
const STOCKS_TABLE_NAME = 'stocks';
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {  

  const productId = event.pathParameters?.productId;

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Product ID is required' }),
    };
  }

  try {
   
    const productData = await dynamoDb.get({
      TableName: PRODUCTS_TABLE_NAME,
      Key: { id: productId },
    }).promise();

    const product = productData.Item;

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    // Получаем количество из таблицы Stocks
    const stockData = await dynamoDb.get({
      TableName: STOCKS_TABLE_NAME,
      Key: { product_id: productId },
    }).promise();

    const stock = stockData.Item;

    const result = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      count: stock ? stock.count : 0,
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
