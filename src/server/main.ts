import { cpus } from 'os';

import minimist from 'minimist';
import * as throng from 'throng';

import startServer from './index';

function getClusterWorkers(clusterArgv): string | number {
  if (typeof clusterArgv === 'number') {
    return clusterArgv;
  } else {
    const webWorkers = process.env.WEB_CONCURRENCY;
    return webWorkers || cpus().length;
  }
}
const argv = minimist(process.argv.slice(2));

if (argv.cluster) { // cluster mode
  const workers = getClusterWorkers(argv.cluster);
  throng({ workers, start: startServer });

} else { // non-cluster mode
  startServer();
}

