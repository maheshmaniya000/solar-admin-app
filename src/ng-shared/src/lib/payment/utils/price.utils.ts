import { Product } from '@solargis/types/customer';
import { ProductVariant } from '@solargis/types/order-invoice';
import { sum } from '@solargis/types/utils';

import { ProductMap } from '../payment.types';

/**
 * Calculate base product price
 *
 * @param productVariant
 * @param product
 */
 export function getProductBasePrice(productVariant: ProductVariant, product: Product): number {
  return typeof product.price === 'string' ? parseInt(product.price, 10) : product.price;
}

/**
 * Calculate additional price per user
 *
 * @param productVariant
 * @param product
 */
 export function getProductUsersPrice(productVariant: ProductVariant, product: Product): number {
  if (productVariant.totalUsers) {
    const freeUsers = product.techSpec.autoProcessDefinition.usersLimit;
    return Math.max(productVariant.totalUsers - freeUsers, 0) * product.techSpec.additionalUserCost;
  } else {
    return 0;
  }
}

/**
 * Calculate price for single product
 *
 * @param productVariant
 * @param product
 */
 export function getproductVariantPrice(productVariant: ProductVariant, product: Product): number {
  return getProductBasePrice(productVariant, product) + getProductUsersPrice(productVariant, product);
}

/**
 * Calculate price for multiple products
 *
 * @param productVariants
 * @param products
 */
export function getProductVariantsPrice(productVariants: ProductVariant[], products: ProductMap): number {
  return sum(productVariants.map(p => getproductVariantPrice(p, products[p.code])));
}

