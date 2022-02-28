// FIXME remove this file when https://github.com/ngneat/spectator/issues/282 is resolved
const fs = require('fs');
const filename = './node_modules/@ngneat/spectator/lib/mock.d.ts';

fs.readFile(filename, 'utf8', (err, data) =>
  fs.writeFile(
    filename,
    data.replace('/// <reference types="jasmine" />\n', ''),
    () => void 0
  )
);
