import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the S3 bucket
    const bucket = new s3.Bucket(this, 'ImportServiceBucket', {
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
      autoDeleteObjects: true, // NOT recommended for production code
    });

    // Deploy an empty file to create the 'uploaded' folder
    new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
      destinationBucket: bucket,
      sources: [s3deploy.Source.data('uploaded/', '')],
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });
  }
}
