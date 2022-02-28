/**
 * This downloads translations from localise.biz to lang/**.json files
 */
import { checkStrings, getLocoLocale, LANG_DIR, LOCALES, saveLocaleFile } from './utils/lang-utils';

console.log('Locales to be processed:', LOCALES);

LOCALES.forEach(locale => {
  getLocoLocale(locale)
    .then(localeObj => {
      const suspectedStrings = checkStrings(localeObj, locale);
      console.log(`'${locale}' has these suspected strings: ${JSON.stringify(suspectedStrings, null, 2)}`);
      return saveLocaleFile(locale, localeObj);
    })
    .then(() => console.log(`Locale '${locale}' saved to folder '${LANG_DIR}'!`))
    .catch(e => console.error(e));
});
