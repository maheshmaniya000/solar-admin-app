import * as bluebird from 'bluebird';
import * as path from 'path';
import * as fs from 'fs';
import {
  compareKeys, checkStrings, getLocoLocale, LANG_DIR, getAppLocale, LOCALES, getMovedKeys, getWordsCounts
} from './utils/lang-utils';
import { flatten } from 'flat';

const fsAsync: any = bluebird.promisifyAll(fs);

checkLangs(LOCALES);

async function checkLangs(locales) {
  const enApp = flatten(await getAppLocale('en'));
  const enLoco = flatten(await getLocoLocale('en'));
  const keyComparison = compareKeys(enApp as object, enLoco as object);
  console.log(keyComparison);

  // resolve which translations moved to a different key
  const movedKeys = getMovedKeys(enApp as object, enLoco as object, keyComparison);
  console.log(`Detected moved keys (from: to): ${JSON.stringify(movedKeys)}`);
  console.log(getWordsCounts(enApp as object, enLoco as object, keyComparison, movedKeys as object));

  locales.forEach(locale => {
    const localeFilepath = `${path.join(LANG_DIR, locale)}.json`;
    fsAsync.readFileAsync(localeFilepath, 'utf8').then(fileContent => {
      console.log('Checking', localeFilepath);
      const localeFlat = JSON.parse(fileContent);
      const stringCheck = checkStrings(localeFlat, locale);
      console.log(stringCheck);
    });
  });
}






