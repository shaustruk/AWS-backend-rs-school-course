import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const productsTableName = 'products';
    const stocksTableName = 'stocks';

    const productsTable  = dynamodb.Table.fromTableName(this, `${productsTableName}Ref`, productsTableName); 
    const stocksTable = dynamodb.Table.fromTableName(this, `${stocksTableName}Ref`, stocksTableName);

    const getProductsListLambda = new lambda.Function(this, 'getProductsListLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda-functions'),
      handler: 'getProductsList.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTableName,
        STOCKS_TABLE_NAME: stocksTableName,
      },
    });


    const getProductsByIdLambda = new lambda.Function(this, 'getProductsByIdLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda-functions'),
      handler: 'getProductsById.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTableName,
        STOCKS_TABLE_NAME: stocksTableName,
      },
    });

    const createProductLambda = new lambda.Function(this, 'createProductLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda-functions'),
      handler: 'createProduct.handler',
      environment: {
        PRODUCTS_TABLE_NAME: productsTableName,
      },
    });

    //access
    productsTable.grantReadData(getProductsListLambda);
    productsTable.grantReadData(getProductsByIdLambda);  
    productsTable.grantWriteData(createProductLambda);  

    stocksTable.grantReadData(getProductsListLambda);
    stocksTable.grantReadData(getProductsByIdLambda);
    stocksTable.grantWriteData(createProductLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, "ProductsApi", {
      restApiName: "Products Service",
      description: "This service serves products",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS, 
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS
      }
    });

    const productsListResource = api.root.addResource('products');
    const productIdResource = productsListResource.addResource('{productId}');
    //list
    productsListResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));

    //create item
    productsListResource.addMethod('POST', new apigateway.LambdaIntegration(createProductLambda));
    //id

    productIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));

  }
}


