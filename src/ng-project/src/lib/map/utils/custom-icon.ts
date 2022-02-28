import * as L from 'leaflet';

type CustomIconType = ((oldIcon: any) => void) & L.Icon;

export const customIcon = L.Icon.extend({
  options: {
    nativeElement: null,
  },

  createIcon() {
    const element = this.options.nativeElement;
    const div = document.createElement('div');
    // eslint-disable-next-line no-underscore-dangle
    this._setIconStyles(div, 'icon');
    div.appendChild(element);

    return div;
  },

  createShadow() {
    return null;
  }
}) as any as CustomIconType;
