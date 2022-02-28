import { validationResult } from 'express-validator/check';
import { UNPROCESSABLE_ENTITY } from 'http-status-codes';


/**
 * Common middleware witch extract request validations errors, set response error and write errors to output.
 * (next middlewares / service handling is stoped)
 *
 * @param req
 * @param res
 * @param next
 */
export function reqValidationMiddleware(req, res, next): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(UNPROCESSABLE_ENTITY).json({errors: errors.mapped()});
  } else {
    next();
  }
}
