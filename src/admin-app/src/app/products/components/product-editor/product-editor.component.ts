import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { isNil } from 'lodash-es';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Product } from '@solargis/types/customer';

import { jsonFormatValidator } from 'ng-shared/shared/directives/validation-json-format.directive';

import { AdminProductsService } from '../../../shared/services/admin-products.service';
import { ProductDetailStore } from '../../services/product-detail.store';

@Component({
  selector: 'sg-admin-product-editor',
  styleUrls: ['../../../shared/components/admin-common.styles.scss'],
  templateUrl: './product-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductEditorComponent implements OnInit, OnChanges {
  @Input() product: Product;

  form: FormGroup;

  constructor(
    private readonly adminProductsService: AdminProductsService,
    private readonly productDetailStore: ProductDetailStore
  ) {}

  getCodeFormControl(): AbstractControl {
    return this.form.get('code');
  }

  getTitleFormControl(): AbstractControl {
    return this.form.get('title');
  }

  getDescriptionSkFormControl(): AbstractControl {
    return this.form.get('descriptionSK');
  }

  getDescriptionEngFormControl(): AbstractControl {
    return this.form.get('descriptionENG');
  }

  getTechSpecFormControl(): AbstractControl {
    return this.form.get('techSpec');
  }

  getCategoryFormControl(): AbstractControl {
    return this.form.get('category');
  }

  ngOnInit(): void {
    this.createForm();
    this.productDetailStore.setValid(this.form.statusChanges.pipe(map(status => status === 'VALID')));
    this.patchForm();
    this.form.valueChanges.subscribe(() => this.productDetailStore.setUnsavedEntity(this.getFormValue()));
  }

  ngOnChanges(): void {
    this.patchForm();
  }

  private codeAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> =>
      timer(500).pipe(
        switchMap(() =>
          this.productDetailStore.isProductCodeAvailable(control.value).pipe(map(available => (available ? null : { 'code-exists': true })))
        )
      );
  }

  private createForm(): void {
    this.form = new FormBuilder().group({
      code: [{ value: undefined, disabled: !isNil(this.product) }, [Validators.required], [this.codeAvailabilityValidator()]],
      title: [undefined, [Validators.required, Validators.maxLength(100)]],
      descriptionSK: [undefined, [Validators.required]],
      descriptionENG: [undefined, [Validators.required]],
      category: [undefined, [Validators.required]],
      price: [undefined, []],
      discount: [undefined, []],
      techSpec: [undefined, [jsonFormatValidator()]]
    });
  }

  private patchForm(): void {
    this.form?.reset();
    this.form?.patchValue({
      ...this.product,
      techSpec: JSON.stringify(this.product?.techSpec || {}, null, 3)
    });
    this.productDetailStore.setUnsavedEntity(this.product);
  }

  private getFormValue(): Product {
    const product: Product = this.form.value;
    product.techSpec = JSON.parse(this.getTechSpecFormControl().value);
    return product;
  }
}
