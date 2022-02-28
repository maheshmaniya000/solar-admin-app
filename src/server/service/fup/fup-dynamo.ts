import { CreateTableInput } from 'aws-sdk/clients/dynamodb';

import { dynamoOpts } from '../../env';

export const fupDataItemTable = `${dynamoOpts.tablePrefix}_fup_data_items`;

export const fupDataItemSchema: CreateTableInput = {
  /* eslint-disable @typescript-eslint/naming-convention */
  TableName: fupDataItemTable,
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
    { AttributeName: 'ts', KeyType: 'RANGE'  }  // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'ts', AttributeType: 'N' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
  /* eslint-enable @typescript-eslint/naming-convention */
};
