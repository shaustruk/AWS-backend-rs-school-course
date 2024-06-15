import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { products } from './mockData';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {  
    if (products){
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
    }
   
else {
    console.error('Error fetching products');
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
  
    };
 
};
}