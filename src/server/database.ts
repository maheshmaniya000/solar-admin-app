import { DynamoDB } from 'aws-sdk';

import { DynamoConnector, DynamoOpts } from '@solargis/dynamo-utils';

import { awsOpts, dynamoOpts } from './env';
import { fupDataItemSchema } from './service/fup/fup-dynamo';

export let dynamo: DynamoDB.DocumentClient;

const LOG_PREFIX = '[DATABASE]';
const dynamoSchemas = [fupDataItemSchema];

export async function connectDynamo(
  uri,
  region,
  localDir?
): Promise<DynamoDB.DocumentClient> {
  console.log(`${LOG_PREFIX} Connecting to DynamoDB ...`);

  return new Promise<DynamoDB.DocumentClient>(resolve => {
    const opts: DynamoOpts = {
      endpoint: uri,
      region,
      accessKeyId: awsOpts.accessKeyId,
      secretAccessKey: awsOpts.secretAccessKey,
      localDir
    };

    const dynamoConnector = new DynamoConnector(opts);
    dynamoConnector.connectDynamo(...dynamoSchemas).then(documentClient => {
      dynamo = documentClient;
      resolve(documentClient);
    });
  });
}

export function connectAll(): Promise<any> {
  const dbConnections: Promise<any>[] = [
    connectDynamo(dynamoOpts.uri, dynamoOpts.region, dynamoOpts.localDir),
  ];
  return Promise.all(dbConnections);
}

