import { DateFormat, Language } from './types';

/**
 * Geetest available langs: zh-cn, zh-hk, zh-tw, en, ja, ko, id, ru, ar, es, pt-pt, fr, de
 * Default for geetest is 'zh-cn'
 * http://docs.geetest.com/install/apirefer/api/web/#product
 *
 * Braintree locale is from
 * https://github.com/braintree/braintree-web-drop-in/tree/master/src/translations
 * Default for braintree is 'en'
 *
 * If adding languages with non-latin alphabet, don't forget to check if there's
 * a font for this language imported
 */
export const availableLanguages: Language[] = [
  { lang: 'id', name: 'Bahasa Indonesia', inReport: true, braintreeLocale: 'id_ID' },
  { lang: 'de', name: 'Deutsch', inReport: true, braintreeLocale: 'de_DE' },
  { lang: 'en', name: 'English', inReport: true, braintreeLocale: 'en_US' },
  { lang: 'es', name: 'Español', inReport: true, braintreeLocale: 'es_ES' },
  { lang: 'fr', name: 'Français', inReport: true, braintreeLocale: 'fr_FR' },
  { lang: 'ko', name: '한국어', inReport: true, braintreeLocale: 'ko_KR' },
  { lang: 'it', name: 'Italiano', inReport: true, braintreeLocale: 'it_IT' },
  { lang: 'ja', name: '日本語', inReport: true, braintreeLocale: 'ja_JP' },
  { lang: 'pl', name: 'Polski', inReport: true, braintreeLocale: 'pl_PL' },
  { lang: 'pt', name: 'Português', inReport: true, braintreeLocale: 'pt_BR' },
  { lang: 'ru', name: 'русский', inReport: true, braintreeLocale: 'ru_RU' },
  { lang: 'vi', name: 'Tiếng Việt', inReport: true, braintreeLocale: 'vi_VN' },
  { lang: 'tr', name: 'Türkçe', inReport: true, braintreeLocale: 'en_US' },
  { lang: 'zh', name: '中文', inReport: true, braintreeLocale: 'zh_CN' }
];

export const availableDateFormats: DateFormat[] = [
  { format: 'dd.MM.yyyy', label: 'dd.mm.yyyy' },
  { format: 'MM.dd.yyyy', label: 'mm.dd.yyyy' },
  { format: 'yyyy.MM.dd', label: 'yyyy.mm.dd' },
  { format: 'dd/MM/yyyy', label: 'dd/mm/yyyy' },
  { format: 'MM/dd/yyyy', label: 'mm/dd/yyyy' },
  { format: 'yyyy/MM/dd', label: 'yyyy/mm/dd' },
  { format: 'dd-MM-yyyy', label: 'dd-mm-yyyy' },
  { format: 'MM-dd-yyyy', label: 'mm-dd-yyyy' },
  { format: 'yyyy-MM-dd', label: 'yyyy-mm-dd' },
];
