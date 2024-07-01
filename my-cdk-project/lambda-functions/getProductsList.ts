import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { IProduct } from './productInterface';


const dynamoDb = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME = 'products';
const STOCKS_TABLE_NAME = 'stocks';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    // Scan the products table
    const productsData = await dynamoDb.scan({ TableName: PRODUCTS_TABLE_NAME }).promise();
    const products = productsData.Items;

    console.log('products:', products);
   // Scan the stocks table
   const stocksData = await dynamoDb.scan({ TableName: STOCKS_TABLE_NAME }).promise();
   const stocks = stocksData.Items || [];
   console.log('stocks:', stocks);
    if (!products?.length || !stocks.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No products found' }),
      };
    }

    
    // Map and join products and stocks data
    const resultJoinStock: IProduct[] = products.map(product => {
      const stock = stocks.find(s => s.product_id === product.id);
      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        count: stock ? stock.count : 0,
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resultJoinStock),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
