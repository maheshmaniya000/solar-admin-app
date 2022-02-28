import * as winston from 'winston';

import { LOG_DB_LEVEL } from '../../env';

export class DBLogger {

    static OFF = 'OFF';
    static INFO = 'INFO';
    static DEBUG = 'DEBUG';

    static WINSTON_LOGGER_NAME = 'db';

    /**
     * DB data query start
     *
     * @param operation
     * @param id
     */
    static dataStart(
        operation: string,
        id: string,
    ): void {
        const meta = this.createWinstonMeta(operation);

        if (LOG_DB_LEVEL.toUpperCase() === DBLogger.DEBUG) {
            const logMsg = { ... meta,
                ID: id,
            };
            winston.loggers.get('db').info('db_start', logMsg);
        }
    }

    /**
     * DB data query stop
     *
     * @param operation
     * @param id
     * @param start
     */
    static dataStop(
        operation: string,
        id: string,
        start: number,
    ): void {
        const meta = this.createWinstonMeta(operation);

        if (LOG_DB_LEVEL.toUpperCase() !== DBLogger.OFF) {
            const duration = Date.now() - start;
            const logMsg = { ... meta,
                ID: id,
                DURATION: duration,
                RESULT: 'OK',
                MSG: ''
            };
            winston.loggers.get('db').info('db_end', logMsg);
        }
    }

    /**
     * DB data query stopped with error
     *
     * @param operation
     * @param id
     * @param start
     * @param error
     * @param params
     */
    static dataError(
        operation: string,
        id: string,
        start: number,
        error: string,
        params: any,
    ): void {
        const meta = this.createWinstonMeta(operation);

        if (LOG_DB_LEVEL.toUpperCase() !== DBLogger.OFF) {
            const duration = Date.now() - start;
            const logMsg = { ... meta,
                ID: id,
                DURATION: duration,
                RESULT: 'error',
                MSG: error,
                PARAMS: params,
            };
            winston.loggers.get('db').info('db_error', logMsg);
        }
    }

    private static createWinstonMeta(operation: string): { LOGGER: string; NAME: string } {
        return {
            LOGGER: this.WINSTON_LOGGER_NAME,
            NAME: operation,
        };
    }
}
