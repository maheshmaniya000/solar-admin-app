import { Route } from '@angular/router';

export interface SideNavigationRoute extends Route {
  data?: {
    // Is this route without content? E. g. solar-meteo/ root page
    empty?: boolean;
    fullscreen?: boolean;
    parent?: string;

    nav?: {
      name?: string;
      icon?: string;
      svgIcon?: string;
      dividerAfter?: boolean;
      textAfter?: string;
      hidden?: boolean;
      /** Hide navigation arrow when route is not opened */
      hideNavArrowWhenNotExpanded?: boolean;
    };

    access?: string;
  };
}
