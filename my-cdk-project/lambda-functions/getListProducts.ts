import { APIGatewayProxyHandler } from 'aws-lambda';
import { IProduct } from "./productInterface";
export const handler: APIGatewayProxyHandler = async () => {

  const products:IProduct[] = [
    { id: '1', title: 'Product 1', price: 100, description: 'super', count: 5 },
    { id: '2', title: 'Product 2', price: 150, description: 'bad', count: 4 },
    { id: '3', title: 'Product 3', price: 200, description: 'norm', count: 5 }
  ];

  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};
