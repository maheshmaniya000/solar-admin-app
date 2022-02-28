import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { FormFieldModule } from '../form-field/form-field.module';
import { SectionModule } from './section.module';

export default {
  title: 'Solargis/Layout/Section',
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule, MatInputModule, FormFieldModule, SgDefaultsModule, CommonModule, SectionModule]
    })
  ]
};

const headerText = {
  name: 'Header text',
  control: { type: 'text' }
};

export const basic: Story = props => ({
  props,
  template: `
    <div class="sg-container">
      <sg-section [headerText]="headerText">
        <div class="sg-grid-8-15">
          <div class="row-15">
            <label for="input-1">Label: </label>
            <mat-form-field>
              <input id="input-1" matInput placeholder="placeholder">
            </mat-form-field>
          </div>
          <mat-divider class="row-full-width" *ngIf="dividerVisible"></mat-divider>
          <div class="row-15">
            <label for="input-2">Label: </label>
            <mat-form-field>
              <input id="input-2" matInput placeholder="placeholder">
            </mat-form-field>
          </div>
          <div class="row-15 no-leading-track">
            <p>
              <a href="http://www.cupcakeipsum.com">Cupcake ipsum:</a>
              Ice cream liquorice halvah danish sesame snaps liquorice. Dragée jelly chocolate chocolate cake.
              Candy canes brownie candy halvah. Chocolate cake marzipan croissant tiramisu tiramisu cheesecake powder
              soufflé sugar plum. Donut tart dragée soufflé croissant. Chupa chups cheesecake marshmallow cheesecake
              candy soufflé cookie. Soufflé marshmallow candy chocolate ice cream tiramisu cookie. Chocolate bar caramels
              jelly beans. Biscuit tootsie roll gingerbread gummies carrot cake sweet roll powder lollipop. Macaroon
              pie donut oat cake wafer jujubes lemon drops fruitcake lollipop. Dragée macaroon brownie gummi bears
              jelly caramels marzipan carrot cake. Jelly jelly beans lollipop bear claw soufflé.
            </p>
          </div>
        </div>
      </sg-section>
    </div>`,
  styles: [
    `
    .sg-container {
      border: 1px solid black;
    }
  `
  ]
});

basic.argTypes = { headerText };
