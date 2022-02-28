import { NgModule } from '@angular/core';

import { AdminSharedModule } from '../shared/admin-shared.module';
import { AddProductToolsComponent } from './components/add-product-tools/add-product-tools.component';
import { EditProductToolsComponent } from './components/edit-product-tools/edit-product-tools.component';
import { ProductEditorComponent } from './components/product-editor/product-editor.component';
import { ProductViewComponent } from './components/product-view/product-view.component';
import { ProductsTableComponent } from './components/products-table/products-table.component';
import { ProductsToolbarComponent } from './components/products-toolbar/products-toolbar.component';
import { ViewProductToolsComponent } from './components/view-product-tools/view-product-tools.component';
import { ProductDetailComponent } from './containers/product-detail/product-detail.component';

@NgModule({
  imports: [AdminSharedModule],
  declarations: [
    ProductsToolbarComponent,
    ProductsTableComponent,
    ProductDetailComponent,
    ProductViewComponent,
    ProductEditorComponent,
    AddProductToolsComponent,
    EditProductToolsComponent,
    ViewProductToolsComponent
  ],
  providers: [],
  entryComponents: []
})
export class ProductsModule {}
