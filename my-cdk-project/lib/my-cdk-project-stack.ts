import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class MyCdkProjectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   
    const productsTableName = 'products';
    const stocksTableName = 'stocks';

    const getProductsListLambda = new lambda.Function(this, 'GetProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTableName,
        STOCKS_TABLE_NAME: stocksTableName,
      },
    });

    const getProductsByIdLambda = new lambda.Function(this, 'GetProductsByIdLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getProductsById.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTableName,
        STOCKS_TABLE_NAME: stocksTableName,
      },
    });

    const createProductLambda = new lambda.Function(this, 'CreateProductLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'createProduct.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTableName,
      },
    });

    const api = new apigateway.RestApi(this, 'ProductsApi', {
      restApiName: 'Products Service',
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProductLambda));

    const productResource = productsResource.addResource('{productId}');
    productResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));
  }
}

const app = new cdk.App();
new MyCdkProjectStack(app, 'MyCdkProjectStack');
