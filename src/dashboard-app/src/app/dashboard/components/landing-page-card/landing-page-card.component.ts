import { Component, Input } from '@angular/core';

@Component({
  selector: 'sg-landing-page-card',
  templateUrl: './landing-page-card.component.html',
  styleUrls: ['./landing-page-card.component.scss']
})
export class LandingPageCardComponent {
  @Input() id: string;
  @Input() hideSubtitle: boolean;
  @Input() actionButtonLink: string;
  @Input() actionButtonName: string;

  getSubtitle = (subtitled: string): string => `dashboard.landingPage.${this.id.toLowerCase()}.${subtitled}`;
}

