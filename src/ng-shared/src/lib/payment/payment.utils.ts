import { Order } from '@solargis/types/customer';
import { OrderPaymentType } from '@solargis/types/customer';


export function isBankPaymentPending(order: Order): boolean {
  return order && order.payment && order.payment.type === OrderPaymentType.BANK
  && order.payment.status === 'PENDING';
}
