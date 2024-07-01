import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the S3 bucket
    const bucket = new s3.Bucket(this, 'ImportServiceBucket', {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
      autoDeleteObjects: true, 
    });

    // Deploy an empty file to create the 'uploaded' folder
    new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
      destinationBucket: bucket,
      sources: [s3deploy.Source.data('uploaded/', '')],
    });

    // Define the Lambda function
    const importProductsFileLambda = new lambda.Function(this, 'importProductsFileLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'importProductsFile.handler',
      code: lambda.Code.fromAsset('lambda-functions'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Grant the Lambda function permissions to interact with the S3 bucket
    bucket.grantPut(importProductsFileLambda);

    // Define the API Gateway
    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Service',
      description: 'This service handles product import operations.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS, 
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS
      }
    });

    // Integrate the Lambda function with the API Gateway
    const importIntegration = new apigateway.LambdaIntegration(importProductsFileLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": 200 }' }
    });

    api.root.addMethod('GET', importIntegration); // GET /import

    // Output the API endpoint
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
    });
  }
}
