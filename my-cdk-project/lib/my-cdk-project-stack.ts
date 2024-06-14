import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Cors } from '@aws-cdk/aws-apigateway';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for getProductsList
    const getProductsList = new lambda.Function(this, 'getProductsList', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getListProducts.handler',
      code: lambda.Code.fromAsset('lambda-functions/')
    });

    // Lambda function for getProductsById
    const getProductsById = new lambda.Function(this, 'getProductsById', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getProductsById.handler',
      code: lambda.Code.fromAsset('lambda-functions/')
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'productsApi', {
      restApiName: 'Products Service',
      description: 'This service serves products.'
    });

    //!
    // Define the /products resource with CORS configuration
    const productsResource = api.root.addResource('products', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,   
      }
    });
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsList));
    const productResource = productsResource.addResource('{productId}', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,   
      }
  });
    productResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsById));

  }
}
