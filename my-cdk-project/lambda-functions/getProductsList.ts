import { APIGatewayProxyHandler } from 'aws-lambda';
import { IProduct } from '../productInterface';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const products:IProduct[] = [
      { id: '1', title: 'Product 1', price: 100, description: 'super', count: 5 },
      { id: '2', title: 'Product 2', price: 150, description: 'bad', count: 4 },
      { id: '3', title: 'Product 3', price: 200, description: 'norm', count: 5 }
    ];
    console.log('list');
    return {
      statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(products),
    };
  } catch (error) {
    console.error('Error fetching products:', error, 'errrrrrrrrrr!!!!!1');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
  
    };
  }
};
