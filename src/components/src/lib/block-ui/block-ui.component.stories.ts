import { Component, Input, NgModule, OnChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';
import { BlockUI, BlockUIModule, NgBlockUI } from 'ng-block-ui';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { FormFieldModule } from '../form-field/form-field.module';

@Component({
  selector: 'sg-block-element-story',
  template: `
    <div class="container" *blockUI="'container'">
      <p>
        Muffin gingerbread fruitcake pudding pudding toffee halvah candy. Pastry
        cotton candy jelly-o biscuit candy toffee candy canes cake. Muffin
        cupcake brownie marshmallow fruitcake. Pie marshmallow danish cotton
        candy chocolate sugar plum jelly-o. Pastry gummi bears sweet jelly-o
        fruitcake pie croissant marshmallow danish. Cupcake tootsie roll cotton
        candy candy jelly-o ice cream. Bonbon brownie croissant ice cream
        jujubes oat cake apple pie halvah jelly. Cookie topping bear claw
        chocolate cake chocolate cake ice cream gummi bears chupa chups.
        Gingerbread carrot cake cheesecake. Ice cream sesame snaps caramels
        jelly beans. Jelly caramels pastry marshmallow caramels biscuit bear
        claw chocolate cake. Cake jelly beans danish. Lemon drops powder tootsie
        roll cheesecake macaroon marshmallow. Jelly beans topping jelly-o
        gingerbread. Ice cream pie jelly-o dessert gingerbread caramels biscuit
        gingerbread. Marshmallow halvah candy canes marshmallow bonbon pastry.
        Marshmallow chocolate bar bear claw. Gingerbread jelly beans tiramisu
        jelly lemon drops gummi bears marshmallow sugar plum. Pie macaroon pie
        candy canes liquorice cotton candy toffee macaroon chocolate bar.
        Tiramisu cupcake halvah topping. Tiramisu cupcake gummies jelly-o jelly
        tart. Ice cream pastry wafer ice cream lollipop cupcake. Tart pudding
        gummi bears. Icing wafer biscuit. Brownie cake cookie cotton candy chupa
        chups gummies pastry candy. Jujubes cotton candy halvah candy chupa
        chups chocolate bar chocolate cake pastry. Cotton candy toffee chocolate
        bear claw jujubes jujubes.
      </p>
      <mat-form-field>
        <input matInput />
      </mat-form-field>
      <button class="sg-large-button" mat-stroked-button color="accent">
        button
      </button>
    </div>

    <span class="blockable-button-container" *blockUI="'container'">
      <button
        class="sg-large-button blockable-button"
        mat-flat-button
        color="accent"
      >
        Blockable button
      </button>
    </span>
    
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 500px;
        border: 1px solid;
        padding: 10px;
      }
      
      .blockable-button-container {
        display: inline-block;
        margin-top: 20px;
      }
    `
  ]
})
class BlockElementStoryComponent implements OnChanges {
  @Input() blocked: boolean;
  @BlockUI('container') containerBlockUi: NgBlockUI;

  ngOnChanges(): void {
    this.blocked ? this.containerBlockUi.start() : this.containerBlockUi.stop();
  }
}

@NgModule({
  declarations: [BlockElementStoryComponent],
  imports: [
    SgDefaultsModule,
    MatButtonModule,
    FormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    BlockUIModule
  ],
  exports: [BlockElementStoryComponent]
})
class BlockUiStoryModule {}

export default {
  title: 'Solargis/Components/BlockUi',
  decorators: [
    moduleMetadata({
      imports: [BlockUiStoryModule]
    })
  ]
};

export const blockElement: Story = props => ({
  props,
  template: `
    <sg-block-element-story [blocked]="blocked"></sg-block-element-story>
   `
});

blockElement.argTypes = {
  blocked: {
    name: 'Blocked',
    control: { type: 'boolean' },
    defaultValue: false
  }
};
