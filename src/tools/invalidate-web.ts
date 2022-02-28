// Invalidate CloudFront distribution
// Usage:
//   DEV:  ts-node src/tools/invalidate-web.ts
//  TEST:  ENV=test ts-node src/tools/invalidate-web.ts
//  PROD:  ENV=prod ts-node src/tools/invalidate-web.ts

import { createInvalidation, resolveStackResource } from '@solargis/aws-utils';
import { v4 } from 'uuid';

const ENV = process.env.ENV || 'dev';

// hardcoded, as in solargis2-apps-cdk
const webStackName = `sg2-web-${ENV}`;
const AWS_REGION = 'eu-west-1';

resolveStackResource(webStackName, 'WebDistribution', 'AWS::CloudFront::Distribution', AWS_REGION)
  .then(DistributionId => {
    const invalidatePaths = ['/*'];
    const ref = v4(); // TODO: get git commit hash
    return createInvalidation(DistributionId, invalidatePaths, ref, AWS_REGION);
  })
  .then(res => console.log(res));
