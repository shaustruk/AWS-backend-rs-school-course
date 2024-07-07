#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ImportServiceS3Stack } from '../lib/import-service-stack';

const app = new cdk.App();
new ImportServiceS3Stack(app, 'ImportServiceS3Stack');
