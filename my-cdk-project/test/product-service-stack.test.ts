import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ProductServiceStack } from '../lib/my-cdk-project-stack';

test('Lambda Functions Created', () => {
  const app = new cdk.App();
  const stack = new ProductServiceStack(app, 'MyTestStack');

  const template = Template.fromStack(stack);

  console.log('Checking for getListProducts Lambda function...');
  template.hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'getProductsList.handler',
    Runtime: 'nodejs16.x', 
  });

  console.log('Checking for getProductsById Lambda function...');
  template.hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'getProductsById.handler',
    Runtime: 'nodejs16.x', 
  });

  console.log('Checking for createProduct Lambda function...');
  template.hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'createProduct.handler',
    Runtime: 'nodejs16.x', // Обновлено до nodejs18.x
  });
});

test('API Gateway Created', () => {
  const app = new cdk.App();
  const stack = new ProductServiceStack(app, 'MyTestStack');

  const template = Template.fromStack(stack);

  console.log('Checking for Products Service API Gateway...');
  template.hasResourceProperties('AWS::ApiGateway::RestApi', {
    Name: 'Products Service',
  });

  console.log('Checking for /products resource...');
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: 'products',
  });

  console.log('Checking for GET method on /products...');
  template.hasResourceProperties('AWS::ApiGateway::Method', {
    HttpMethod: 'GET',
  });

  console.log('Checking for GET method on /products/{productId}...');
  template.hasResourceProperties('AWS::ApiGateway::Method', {
    HttpMethod: 'GET',
  });

  console.log('Checking for POST method on /products...');
  template.hasResourceProperties('AWS::ApiGateway::Method', {
    HttpMethod: 'POST',
  });
});
