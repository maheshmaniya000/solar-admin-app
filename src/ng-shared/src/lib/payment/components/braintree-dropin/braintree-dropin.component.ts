import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import BraintreeWebDropIn from 'braintree-web-drop-in';
import { first, map } from 'rxjs/operators';

import { OrderPaymentType } from '@solargis/types/customer';

import { availableLanguages } from '../../../core/models';
import { PaymentService } from '../../services/payment.service';


@Component({
  selector: 'sg-braintree-dropin',
  templateUrl: './braintree-dropin.component.html',
  styleUrls: ['./braintree-dropin.component.scss']
})
export class BraintreeDropinComponent implements OnInit {

  @Input() sgAccountId: string;
  @Input() sgOrderId: string;
  @Input() sgCompanyId: string;
  @Input() price: string;
  @Input() type: string;

  @Output() onSuccess = new EventEmitter<boolean>();
  @Output() onChangeMethod = new EventEmitter<void>();

  fullscreenLoading = true;
  processingPayment = false;

  dropInInstance: any;

  error: string;

  constructor(
    public paymentService: PaymentService,
    public transloco: TranslocoService,
  ) { }

  ngOnInit(): void {
    // #dropin-container element needs to be rendered first
    setTimeout(() => this.createDropin());
  }

  createDropin(): void {
    this.paymentService.getClientToken(this.sgAccountId, this.sgCompanyId, this.sgOrderId).pipe(
      first(),
      map(clientToken => {
        this.fullscreenLoading = false;

        const activeLang = this.transloco.getActiveLang();
        const lang = availableLanguages.find(l => l.lang === activeLang);

        // https://braintree.github.io/braintree-web-drop-in/docs/current/module-braintree-web-drop-in.html#.create
        const dropInConfig = {
          authorization: clientToken,
          selector: '#dropin-container',
          card: {
            cardholderName: {
              required: true
            }
          },
          vaultManager: true,
          locale: lang && lang.braintreeLocale || 'en_US'
        };

        BraintreeWebDropIn.create(dropInConfig, (err, dropInInstance) => {
          if (err) {
            console.log(err);
            return;
          }
          this.dropInInstance = dropInInstance;
        }
        );
      }),
    ).subscribe();
  }

  async pay(): Promise<void> {
    this.processingPayment = true;
    this.error = null;

    try {
      const payload = await this.dropInInstance.requestPaymentMethod();

      if (payload.nonce) {
        this.fullscreenLoading = true;

        this.paymentService.payOrder(this.sgAccountId, this.sgCompanyId, this.sgOrderId, OrderPaymentType.BRAINTREE, payload.nonce).pipe(
          first()).subscribe(success => {
            this.onSuccess.emit(success);
            this.processingPayment = false;
            this.fullscreenLoading = false;
          });
      }

    } catch (err) {
      this.error = err.message;
      this.processingPayment = false;
    }
  }

}
