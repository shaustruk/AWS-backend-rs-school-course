import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
export class ImportServiceS3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this, 'ImportS3Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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
    const importProductsFileLambda = new lambda.Function(this, 'importProductsFileLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'importProductsFile.handler',
      code: lambda.Code.fromAsset('lambda-functions'),
      environment: {
        BUCKET_NAME: bucket.bucketName,        
      },
    });

    const importFileParserLambda = new lambda.Function(this, 'importFileParserLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'importFileParser.handler',
      code: lambda.Code.fromAsset('lambda-functions'),
      environment: {
        BUCKET_NAME: bucket.bucketName,        
      },
    });

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(importFileParserLambda), {
      prefix: 'uploaded',
    });
    bucket.addEventNotification(s3.EventType.OBJECT_CREATED_COPY, new s3n.LambdaDestination(importFileParserLambda), {
      prefix: 'parsed',
    })

    bucket.grantReadWrite(importProductsFileLambda);
    bucket.grantReadWrite(importFileParserLambda);
    bucket.grantDelete(importFileParserLambda);

    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
        restApiName: 'Import Service',
        defaultCorsPreflightOptions: {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowMethods: apigateway.Cors.ALL_METHODS,    
          allowHeaders: ['Content-Type,X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
        },
    });

    const importProductsFileIntegration = new apigateway.LambdaIntegration(importProductsFileLambda);
    api.root.addResource('import').addMethod('GET', importProductsFileIntegration, {
      authorizationType: apigateway.AuthorizationType.NONE,
      requestParameters: {
        'method.request.querystring.name': true,
      },
      requestValidatorOptions: {
        validateRequestParameters: true,
      }
    });
  }
}