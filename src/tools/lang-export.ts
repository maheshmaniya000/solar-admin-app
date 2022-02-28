/**
 * This script uploads the content of en.json to localise.biz
 */
import {
  compareKeys, getAppLocale, getLocoLocale, importLocoLocale, getMovedKeys,
  getWordsCounts
} from './utils/lang-utils';
import { flatten, unflatten } from 'flat';

exportLang('en');

async function exportLang(mainLocale = 'en') {

  // check the key changes
  const mainLocaleApp = flatten(await getAppLocale(mainLocale));
  const mainLocaleLoco = flatten(await getLocoLocale(mainLocale));
  const keyComparison = compareKeys(mainLocaleApp as object, mainLocaleLoco as object);
  console.log(keyComparison);

  // resolve which translations moved to a different key
  const movedKeys = getMovedKeys(mainLocaleApp as object, mainLocaleLoco as object, keyComparison);
  console.log(`Detected moved keys (from: to): ${JSON.stringify(movedKeys)}`);
  console.log(getWordsCounts(mainLocaleApp as object, mainLocaleLoco as object, keyComparison, movedKeys as object));

  // import mainLocale (en) to Loco:
  const importRes = await importLocoLocale(mainLocale, unflatten(mainLocaleApp, { object: true }), true);
  console.log('All the importing done successfully!');
  // console.log(importRes);

}
