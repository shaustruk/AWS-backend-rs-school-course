import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Cors } from '@aws-cdk/aws-apigateway';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function for getProductsList
    const getProductsListLambda = new lambda.Function(this, 'getProductsListHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getProductsList.handler',
      code: lambda.Code.fromAsset('lambda-functions')
    });

    // Lambda function for getProductsById
    const getProductByIdLambda = new lambda.Function(this, 'getProductByIdHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getProductById.handler',
      code: lambda.Code.fromAsset('lambda-functions')
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'productsApi', {
      restApiName: 'Products Service',
      description: 'This service serves products.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));

    const productResource = productsResource.addResource('{productId}');
    productResource.addMethod('GET', new apigateway.LambdaIntegration(getProductByIdLambda));
 
  }
}
