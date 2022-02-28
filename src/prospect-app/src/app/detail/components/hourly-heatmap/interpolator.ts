import { interpolateHcl } from 'd3-interpolate';

import { DataStats } from '@solargis/types/dataset';
import { range } from '@solargis/types/utils';

/**
 * Class to interpolate between colors
 * D3-interpolate can interpolate only between two colors so we need to emulate that
 */
export class Interpolator {

  interpolators = [];

  constructor(private readonly colors: string[], private readonly stats: DataStats) {
    range(colors.length - 1).forEach(index => {
      this.interpolators.push(
        interpolateHcl(colors[index], colors[index + 1])
      );
    });
  }

  interpolate(value: number): string {
    // scale input value on range
    let ranged = (value - this.stats.min) / (this.stats.max - this.stats.min);
    // discard high or low values

    if (ranged > 1.) {ranged = 1.;}
    if (ranged < 0.) {ranged = 0;}

    // calculate range for each interpolator
    const interpolatorRange = 1 / this.interpolators.length;
    // find which interpolator to use
    const i = Math.floor(ranged / interpolatorRange);
    // scale interpolate value on interpolator
    const adjusted = (ranged - (i * interpolatorRange)) / interpolatorRange;

    if (i >= this.interpolators.length) {return this.colors[this.colors.length - 1];}
    else {return this.interpolators[i](adjusted);}
  }
}
