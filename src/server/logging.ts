import { format } from 'logform';
import * as winston from 'winston';


/**
 * Initialize logging
 */
export function initLogging(): void {

  const developerFormatter = format.printf(msg => {
    if (msg.message.startsWith('fup_')) {
      // FIXME this is quite heavy switch, isn't it possible to implement it with simle map? <key: eventId, value: logPattern>
      // FIXME or probably better with json-templater/string: https://github.com/lightsofapollo/json-templater?
      switch (msg.message) {
        case 'fup_rule_start':
          return `[${msg.RULE}] started, id:${msg.ID}`;
        case 'fup_rule_end':
          return `[${msg.RULE}] end, id:${msg.ID}` +
            `... duration:${msg.DURATION}, result:${msg.RESULT}, used_count:${msg.USED_COUNT}, allowed_count:${msg.ALLOWED_COUNT}`;
        case 'fup_rule_no_data':
          return `[${msg.RULE}] end with no data, id:${msg.ID} ` +
            `... duration:${msg.DURATION}, result:${msg.RESULT}`;
        case 'fup_rule_error':
          return `[{msg.RULE}] error, id:${msg.ID} ` +
            `... duration:${msg.DURATION}, result:${msg.RESULT}, msg:${msg.MSG}`;
        case 'fup_middleware_start':
          return `[FUP-MIDDLEWARE] started, sub:${msg.SUB}, ip:${msg.IP}, resource:${msg.RESOURCE}`;
        case 'fup_middleware_end':
          return `[FUP-MIDDLEWARE] end, sub:${msg.SUB}, ip:${msg.IP}, resource:${msg.RESOURCE} ` +
            `... duration:${msg.DURATION}, result:${msg.RESULT}`;
        case 'fup_middleware_error':
          return `[FUP-MIDDLEWARE] error, sub:${msg.SUB}, ip:${msg.IP}, resource:${msg.RESOURCE} ` +
            `... duration:${msg.DURATION}, result:${msg.RESULT}, msg:${msg.MSG}`;
        case 'fup_data_service_start':
          return `[FUP-DATA-SERVICE] started, operation:${msg.OPERATION}, id:${msg.ID}`;
        case 'fup_data_service_end':
          return `[FUP-DATA-SERVICE] end, operation:${msg.OPERATION}, id:${msg.ID} ` +
            `... duration:${msg.DURATION}, result:${msg.RESULT}`;
        case 'fup_data_service_error':
          return `[FUP-DATA-SERVICE] error, operation:${msg.OPERATION}, id:${msg.ID} ` +
            `... duration:${msg.DURATION}, result:${msg.RESULT}, msg:${msg.MSG}`;
      }
    } else if (msg.message.startsWith('auth_')) {
      switch (msg.message) {
        case 'auth_data_service_start':
          return `[AUTH-DATA-SERVICE] started, operation:${msg.OPERATION}, id:${msg.ID}`;
        case 'auth_data_service_end':
          return `[AUTH-DATA-SERVICE] end, operation:${msg.OPERATION}, id:${msg.ID} ` +
            `... duration:${msg.DURATION}, result:${msg.RESULT}`;
        case 'auth_data_service_error':
          return `[AUTH-DATA-SERVICE] error, operation:${msg.OPERATION}, id:${msg.ID} ` +
            `... duration:${msg.DURATION}, result:${msg.RESULT}, msg:${msg.MSG}`;
      }
    } else if (msg.message.startsWith('db_')) {
      switch (msg.message) {
        case 'db_start':
          return `${msg.NAME}: ${msg.message} id:${msg.ID} `;
        case 'db_end':
          return `${msg.NAME}: ${msg.message} id:${msg.ID} ${msg.RESULT} ${msg.DURATION}`;
        default:
          return `${msg.NAME}: ${msg.message} id:${msg.ID} ${msg.RESULT} ${msg.DURATION} ${msg.MSG}`;
      }
    } else {
      return JSON.stringify(msg);
    }
  });

  let consoleOutput;
  if (process.env.LOG_DEVELOP === 'true') {
    consoleOutput = new winston.transports.Console({
      format: developerFormatter,
      level: process.env.LOG_LEVEL,
    });
  } else {
    consoleOutput = new winston.transports.Console({
      level: process.env.LOG_LEVEL,
    });
  }

  winston.loggers.add('fup', {
    level: process.env.LOG_LEVEL,
    transports: [consoleOutput],
  });
  winston.loggers.add('auth', {
    level: process.env.LOG_LEVEL,
    transports: [consoleOutput],
  });
  winston.loggers.add('db', {
    level: process.env.LOG_LEVEL,
    transports: [consoleOutput],
  });
}
