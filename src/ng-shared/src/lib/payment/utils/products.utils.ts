import { Product } from '@solargis/types/customer';
import { ProspectProductCodes } from '@solargis/types/order-invoice';


export function getProductNameTranslation(product: Product): string {
  const map = {
    [ProspectProductCodes.PROSPECT_BASIC]: 'PROSPECT_BASIC',
    [ProspectProductCodes.PROSPECT_PRO]: 'PROSPECT_PRO',
    [ProspectProductCodes.BASIC_TO_PRO]: 'UPGRADE',
  };

  if (map[product.code]) {
    return 'common.subscriptionType.' + map[product.code];
  } else {
    return product.descriptionENG;
  }
}
