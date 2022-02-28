import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

export default {
  title: 'Solargis/Typography',
  decorators: [
    moduleMetadata({
      imports: [
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        SgDefaultsModule,
        MatSelectModule,
        MatFormFieldModule,
        BrowserAnimationsModule
      ]
    })
  ]
};

export const classes: Story = () => ({
  template: `
    <div class="container">
      <b>Level:</b>
      <b>Class:</b>
      <b>Example:</b>

      <b>Display 2</b>
      <span>.mat-display-2</span>
      <div class="mat-display-2">
        Header of the Featured dialogs
      </div>

      <b>Display 1</b>
      <span>.mat-display-1</span>
      <div class="mat-display-1">
        Toolbar name (e.g. Project name, Properties)
      </div>

      <b>Headline</b>
      <span>.mat-headline</span>
      <div class="mat-headline">
        Modal window names (“Discard draft?”)
      </div>

      <b>Title</b>
      <span>.mat-title</span>
      <div class="mat-title">
        Content in-card header (e.g. Table name)<br/>
        Section header
      </div>

      <b>Subheading 2</b>
      <span>.mat-subheading-2</span>
      <div class="mat-subheading-2">
        Dialog header
      </div>

      <b>Subheading 1</b>
      <span>.mat-subheading-1</span>
      <div class="mat-subheading-1">
        Main tabs: MAPS Projects
      </div>

      <b>Body 2</b>
      <span>.mat-body-2</span>
      <div class="mat-body-2">
        Strong body text<br>
        Dropdown menu text<br>
        Table header
      </div>

      <b>Body 1</b>
      <span>.mat-body-1</span>
      <div class="mat-body-1">
        Base body text<br>
        Tool button text (Toolbar)<br>
        Text in dialogs (e.g. Alert)
      </div>

      <b>Caption</b>
      <span>.mat-caption</span>
      <div class="mat-caption">
        Hint<br>
        Text label (Content card)<br>
        Error info (under input)
      </div>

      <b>Input</b>
      <span>Used only in components</span>
      <mat-form-field>
        <mat-label>Favorite food</mat-label>
        <mat-select>
          <mat-option value="apple">
            Apple
          </mat-option>
        </mat-select>
      </mat-form-field>

      <b>Button</b>
      <span>Used only in components</span>
      <div>
        <button mat-flat-button color="accent">
          <mat-icon>add_circle_outline</mat-icon>
          Primary button
        </button>
        <br>
        <br>
        <button class="sg-small-button" mat-stroked-button color="accent">
          Secondary button
        </button>
      </div>
    </div>
    `,
  styles: [
    `
      .container {
        display: grid;
        grid-template-columns: repeat(3, auto);
        grid-row-gap: 30px;
        align-items: center;
        justify-content: space-between;
        background-color: #F4F5F7;
        color: #4B5B75;
        padding: 20px;
      }
    `
  ]
});

export const elements: Story = () => ({
  template: `
    <div>
      <b>Paragraph</b>
      <p>
        Cake ice cream carrot cake. Jelly macaroon soufflé muffin. Cupcake oat cake
        gingerbread cookie jelly beans marzipan pastry candy wafer. Carrot cake pie
        cake halvah dragée jelly-o ice cream. Cookie biscuit sweet roll caramels
        dessert carrot cake pastry. Chocolate bar cheesecake cotton candy tart tart.
        Icing toffee bonbon topping wafer dessert ice cream lemon drops biscuit.
        Candy wafer caramels toffee candy jelly biscuit. Tart lemon drops bonbon.
        Jujubes croissant tiramisu caramels soufflé ice cream oat cake. Jelly beans
        ice cream sweet roll marshmallow jelly-o chupa chups sweet dessert cake.
        Oat cake cotton candy candy canes. Caramels cake tootsie roll croissant
        cotton candy cookie. Jelly beans fruitcake donut cotton candy jelly beans
        icing chocolate. Cookie caramels cupcake gummies marshmallow. Donut soufflé
        cupcake cake. Croissant chocolate bar fruitcake fruitcake lollipop cheesecake
        wafer dessert. Pie cake oat cake cupcake cotton candy cotton candy gummi bears.
      </p>
      <b>H1</b>
      <h1>Cake ice cream carrot cake. Jelly macaroon soufflé muffin</h1>
      <b>H2</b>
      <h2>Cookie biscuit sweet roll caramels dessert carrot cake pastry</h2>
      <b>H3</b>
      <h3>Croissant chocolate bar fruitcake fruitcake lollipop cheesecake</h3>
      <b>H4</b>
      <h4>Jelly beans fruitcake donut cotton candy jelly beans</h4>
      <b>H5</b>
      <h5>Pie cake oat cake cupcake cotton candy cotton candy gummi bears</h5>
      <b>H6</b>
      <h6>Jujubes croissant tiramisu caramels soufflé ice cream oat cake</h6>
      <b>Anchor</b>
      <br>
      <a>Croissant chocolate bar</a>
      <br>
      <div class="ul-container">
        <b>Unordered list</b>
        <ul>
          <li>croissant</li>
          <li>chocolate</li>
          <li>tiramisu</li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
    .ul-container {
      margin-top: 10px;
    }
  `
  ]
});
