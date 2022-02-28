import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Observable } from 'rxjs';

import { sequenceQuery } from '@solargis/dynamo-utils';

import { dynamo } from '../../../database';
import { fupDataItemTable } from '../fup-dynamo';
import { FUPLogger } from '../fup-logger';
import { FUPDataItem } from './dto/fup-data-item';
import { FUPError } from './dto/fup-error';
import { FUPDataServiceInterface } from './fup-data.service';

export class FUPDataService implements FUPDataServiceInterface {

  saveData(item: FUPDataItem): Observable<boolean> {
    const start = Date.now();
    const opName = 'save-data';
    const key = this.createIdByItem(item);
    FUPLogger.dataStart(opName, key);

    const params: DocumentClient.PutItemInput = {
      /* eslint-disable @typescript-eslint/naming-convention */
      TableName: fupDataItemTable,
      Item: { ...item, id: key }
      /* eslint-enable @typescript-eslint/naming-convention */
    };


    // convert promise to RXJS
    return new Observable(observer => {
      dynamo.put(params).promise()
        .then(() => {
          FUPLogger.dataStop(opName, key, start);

          observer.next(true);
          observer.complete();
        })
        .catch(err => {
          FUPLogger.dataError(opName, key, start, err);

          observer.next(false);
          observer.complete();
        });
    });
  }

  getByIP(readConsistency: boolean, resourceName: string, ip: string, from: number): Observable<Array<FUPDataItem>|FUPError> {
    const start = Date.now();
    const opName = 'get-by-ip';
    const key = this.createId(resourceName, ip);
    FUPLogger.dataStart(opName, key);

    const params: DocumentClient.QueryInput = {
      /* eslint-disable @typescript-eslint/naming-convention */
      TableName: fupDataItemTable,
      KeyConditionExpression: 'id = :id and #ts >= :from',
      ExpressionAttributeValues: { ':id': key, ':from': from },
      ExpressionAttributeNames: { '#ts': 'ts' },
      Select: 'ALL_ATTRIBUTES'
      /* eslint-enable @typescript-eslint/naming-convention */
    };

    return this.executeQuery(params, readConsistency, key, opName, start);
  }

  getByUserId(readConsistency: boolean, resourceName: string, userId: string, from: number): Observable<Array<FUPDataItem>|FUPError> {
    const start = Date.now();
    const opName = 'get-by-user-id';
    const key = this.createId(resourceName, null, userId);
    FUPLogger.dataStart(opName, key);

    const params: DocumentClient.QueryInput = {
      /* eslint-disable @typescript-eslint/naming-convention */
      TableName: fupDataItemTable,
      KeyConditionExpression: 'id = :id and #ts >= :from',
      ExpressionAttributeValues: { ':id': key, ':from': from },
      ExpressionAttributeNames: { '#ts': 'ts' },
      Select: 'ALL_ATTRIBUTES'
      /* eslint-enable @typescript-eslint/naming-convention */
    };

    return this.executeQuery(params, readConsistency, key, opName, start);
  }

  /**
   * Execute query by defined params, key, opName.
   *
   * @param params
   * @param readConsistency should be query executed in 'strong consistent' mode ?
   * @param key used in dynamo
   * @param opName type of query
   * @param start when execution of query starts
   * @returns
   */
  private executeQuery(
    params: DocumentClient.QueryInput,
    readConsistency: boolean,
    key: string,
    opName: string,
    start: number
  ): Observable<Array<FUPDataItem>|FUPError> {
    return new Observable(observer => {
      sequenceQuery<FUPDataItem>(dynamo, params, {
        consistent: readConsistency
      })
        .then(res => {
          FUPLogger.dataStop(opName, key, start);

          observer.next(res);
          observer.complete();
        })
        .catch(err => {
          FUPLogger.dataError(opName, key, start, err);

          const error: FUPError = {
            code: err.code,
            message: err.message
          };
          observer.next(error);
          observer.complete();
        });
    });
  }

  private createIdByItem(item: FUPDataItem): string {
    return this.createId(item.resName, item.ip, item.sub);
  }

  private createId(resourceName: string, ip?: string, userId?: string): string {
    // create id
    if (userId) {
      return resourceName + '-' + userId;
    } else {
      return resourceName + '-' + ip;
    }
  }

}
