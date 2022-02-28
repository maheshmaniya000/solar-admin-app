import { path as rootPath } from 'app-root-path';
import * as bluebird from 'bluebird';
import { flatten } from 'flat';
import * as fs from 'fs';
import * as MessageFormat from 'messageformat';
import fetch from 'node-fetch';
import * as path from 'path';

import { resolveVariable } from '@solargis/aws-utils';

const fsAsync: any = bluebird.promisifyAll(fs);

const SECRET_NAME = 'sg2/dev/i18n';
const SECRET_KEY = 'LOCO_API_KEY';
export const LANG_DIR = path.join(rootPath, 'src/ng-shared/src/assets/i18n');
// export const LANG_DIR = path.join(rootPath, 'src/ng-shared/src/assets/i18n/test');  // TODO: move to tools dir, everything in assets gets deployed as client code - for testing only!
export const LOCALES = ['id', 'de', 'es', 'fr', 'ko', 'it', 'ja', 'pl', 'pt', 'ru', 'vi', 'tr', 'zh'];  // TODO: add locale here
// export const LOCALES = ['es'];  // for testing only!
// const locoApiKey = 'JIs_EdPCoJo_XFEEmuXO7MtDH7myumIau';  // for testing only!

async function getApiKey(): Promise<string> {
  const variableKey = `{{resolve:secretsmanager:${SECRET_NAME}:SecretString:${SECRET_KEY}}}`;
  return resolveVariable(variableKey);
}

export function getLocaleList(removeLocale: string | null = 'en'): string[] {
  const filepaths = getLocaleFilepaths();
  const locales = Object.keys(filepaths);
  if (removeLocale) locales.splice(locales.indexOf(removeLocale), 1);  // to get rid of the main import locale, such as 'en'
  return locales;
}

export function getLocaleFilepaths(): any {
  const localeFilepaths = {};
  const files = fs.readdirSync(LANG_DIR);
  files.forEach(filepath => {
    const locale = path.basename(filepath).split('.')[0];
    if (path.extname(filepath) === '.json' && locale.length === 2) {
      localeFilepaths[locale] = path.join(LANG_DIR, filepath);
    }
  });
  return localeFilepaths;
}

export async function getAppLocale(locale: string): Promise<any> {
  return JSON.parse(await fsAsync.readFileAsync(path.join(LANG_DIR, locale + '.json'), 'utf8'))
}

export async function getLocoLocale(locale: string): Promise<any> {
  const locoApiKey = await getApiKey();
  const resourceUrl = `https://localise.biz/api/export/locale/${locale}.json?key=${locoApiKey}`;
  console.log(`Getting '${locale}' from: ${resourceUrl}`);
  return fetch(resourceUrl).then(response => response.json());
}

export async function importLocoLocale(locale: string, localeObj: any, deleteAbsetnt = false): Promise<any> {
  const locoApiKey = await getApiKey();
  const options = {
    method: 'POST',
    body: JSON.stringify(localeObj),
    headers: { 'Content-Type': 'application/json' }
  };
  const url = `https://localise.biz/api/import/json`;
  const params = {
    key: locoApiKey,
    locale,
    path: getLocaleFilepath(locale),
    'delete-absent': deleteAbsetnt.toString(), // set true just for en
  };

  if (deleteAbsetnt) {
    const date = new Date();
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    params['tag-new'] = `new-${dateStr}`; // tags for new assets
    params['tag-updated'] = `updated-${dateStr}`; // tags for updated assets
  }

  const urlWithParams = `${ url }?${ new URLSearchParams(params).toString() }`;

  console.log(`Importing '${locale}' to: ${urlWithParams}`);
  return fetch(urlWithParams, options).then(response => response.json());
}

export function saveLocaleFile(locale: string, localeObj: any): Promise<any> {
  const jsonStr = JSON.stringify(adjustLocaleObj(localeObj), null, 2);
  return fsAsync.writeFileAsync(getLocaleFilepath(locale), jsonStr, 'utf8');
}

function getLocaleFilepath(locale: string): string {
  return `${path.join(LANG_DIR, locale)}.json`;
}

export function checkStrings(stringObj: object, locale: string = 'en'): object {
  const flatObj = flatten(stringObj);
  const mf = new MessageFormat(locale);
  const suspectedStrings: any = {};
  Object.keys(flatObj).forEach(key => {
    const val = flatObj[key];
    // TODO: use better way of checking HTML strings:
    if (val.indexOf('<') > -1 && val.indexOf('>') > -1 && val.split('>').length !== val.split('<').length) suspectedStrings[key] = val;
    try {
      mf.compile(val);  // sometimes can be used '｛' instead of '{'
    } catch(e) {
      suspectedStrings[key] = val;
    }
  });
  return suspectedStrings;
}

export function compareKeys(origObj: object, compareObj: object): KeyComparison {
  const origKeys = Object.keys(flatten(origObj));
  const compareKeys = Object.keys(flatten(compareObj));
  const added: string[] = [];
  const removed: string[] = [];
  origKeys.forEach(key => {
    if (compareKeys.indexOf(key) < 0) added.push(key);
  });
  compareKeys.forEach(key => {
    if (origKeys.indexOf(key) < 0) removed.push(key);
  });
  return { added, removed };
}

type KeyComparison = {
  added: string[],
  removed: string[]
}

export function getMovedKeys(origObj: object, compareObj: object, keyComparison: KeyComparison) {
  const movedKeys: any = {};
  keyComparison.removed.forEach(key1 => {
    keyComparison.added.forEach(key2 => {
      if (flatten(compareObj)[key1] === flatten(origObj)[key2]) {
        movedKeys[key1] = key2;
      }
    });
  });
  return movedKeys;  // {from: to}
}

export function getWordsCounts(origObj: object, compareObj: object, keyComparison: KeyComparison, movedKeys: object) {
  const wordsMoved = countWords(compareObj, Object.keys(movedKeys));
  const wordsAdded = countWords(origObj, keyComparison.added) - wordsMoved;
  const wordsRemoved = countWords(compareObj, keyComparison.removed) - wordsMoved;
  return { wordsAdded, wordsRemoved, wordsMoved };
}

function countWords(langObj: object, keyList: string[]): number {
  let wordCount = 0;
  const flattenLang = flatten(langObj);
  keyList.forEach(key => {
    if (flattenLang[key]) wordCount += flattenLang[key].split(' ').length;
    else console.log(`Key ${key} not found!`);
  });
  return wordCount;
}

function adjustLocaleObj(translObj: any | string): any {
  if (typeof translObj === 'string') {
    translObj = adjustTranslation(translObj);
  } else {
    Object.keys(translObj).forEach(key => {
      translObj[key] = adjustLocaleObj(translObj[key]);
    });
  }
  return translObj;
}

function adjustTranslation(translation: string): string {
  // TODO: add here some more adjustments if needed
  return translation
    .replace(/\n/g, '')
    .replace(/｛/g, '{')
    .replace(/｝/g, '}');
}



