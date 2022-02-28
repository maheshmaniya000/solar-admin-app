import { Product } from '@solargis/types/customer';

export type PaymentMethod = 'card' | 'bank';

export type ProductMap = {
  [productCode: string]: Product;
};
