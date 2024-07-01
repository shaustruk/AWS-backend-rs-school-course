import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the S3 bucket
    const bucket = new s3.Bucket(this, 'ImportServiceBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
            allowedOrigins: ['*'],
            allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE, s3.HttpMethods.HEAD],
            allowedHeaders: ['*'],            
        }
      ]
    });

    bucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:*',],
      resources: [`${bucket.bucketArn}/uploaded/*`, `${bucket.bucketArn}/parsed/*`],
      principals: [new iam.ServicePrincipal('lambda.amazonaws.com')],      
    }));

    // Deploy an empty file to create the 'uploaded' folder
    new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
      destinationBucket: bucket,
      sources: [s3deploy.Source.data('uploaded/', '')],
    });

    // Define the importProductsFile Lambda function
    const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFileLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'importProductsFile.handler',
      code: lambda.Code.fromAsset('lambda-functions'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Grant the Lambda function permissions to interact with the S3 bucket
    bucket.grantReadWrite(importProductsFileLambda);

    // Define the API Gateway
    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Service',
      cloudWatchRole: true,
      description: 'This service handles product import operations.',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'X-Amz-Date', 'X-Amz-Security-Token'],
      },
    });

    // Integrate the Lambda function with the API Gateway
    const importIntegration = new apigateway.LambdaIntegration(importProductsFileLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": 200 }' }
    });
    const importResource = api.root.addResource('import');
    importResource.addMethod('GET', importIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
      requestParameters: {
        'method.request.querystring.name': true
      }
    }); 

    // Define the importFileParser Lambda function
    const importFileParserLambda = new lambda.Function(this, 'ImportFileParserLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'importFileParser.handler',
      code: lambda.Code.fromAsset('lambda-functions'),
    });

    // Grant the Lambda function permissions to interact with the S3 bucket
    bucket.grantRead(importFileParserLambda);

    // Add S3 event notification to trigger the importFileParser Lambda function
    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(importFileParserLambda), {
      prefix: 'uploaded/',
    });

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED_COPY, new s3n.LambdaDestination(importFileParserLambda), {
      prefix: 'parsed',
    })

    // Output the API endpoint
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
    });
  }
}
