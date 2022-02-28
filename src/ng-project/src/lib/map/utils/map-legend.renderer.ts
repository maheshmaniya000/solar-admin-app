import { translate } from '@ngneat/transloco';

import { DataLayer, isLayerCodelistValue } from '@solargis/dataset-core';
import { getToggleKeys, resolveHtml, resolveUnitValue, Unit, UnitToggleSettings } from '@solargis/units';

import { GrassFileLegendList, GrassFileValueColor } from './grass-file.parser';

const legendReversed = ['ALB', 'GHI_season', 'DNI_season', 'SLO'];
const legendNaFirst = ['GHI_season', 'DNI_season'];

export class MapLegendRenderer {

  private readonly darkGrey = 'rgba(0, 0, 0, 0.7)';
  private readonly barWidth = 30; // width of color column
  readonly unit: Unit;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private readonly layer: DataLayer,
    private readonly unitToggle: UnitToggleSettings
  ) {
    this.unit = layer.unit;
  }

  renderRangeLegend(list: GrassFileLegendList, startX: number): void {
    const layerKey = this.layer.key;
    let notAvailable: [GrassFileValueColor, GrassFileValueColor] = null;

    let reversed = false;
    if (legendReversed.includes(layerKey)) {
      if (legendNaFirst.includes(layerKey)) {
        const [na, ...rest] = list as [GrassFileValueColor, GrassFileValueColor][];
        notAvailable = na;
        list = rest;
      }
      reversed = true;
      list.reverse();
    }
    const linesCount = list.length;

    const topSpacing = reversed ? 5 : 0;
    const canvasHeight = this.ctx.canvas.clientHeight || this.ctx.canvas.height;
    const bottomSpacing = notAvailable ? (canvasHeight * 0.15) : 20;
    const levelsHeight = canvasHeight - bottomSpacing - topSpacing;
    const levelHeight = levelsHeight / linesCount;
    const labelHeight = 9;
    let cumulatedLabelIndicator = labelHeight;

    list.forEach((line: [GrassFileValueColor, GrassFileValueColor], i) => {
      const [min, max] = line;
      const rectPosY = levelHeight * (linesCount - (i + 1)) + topSpacing;

      const gradient = this.ctx.createLinearGradient(startX, rectPosY, startX, levelHeight * (linesCount - i) + topSpacing);
      gradient.addColorStop(0, max.color);
      gradient.addColorStop(1, min.color);
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(startX, rectPosY, this.barWidth, levelHeight + 1);

      const isCodelistValue = isLayerCodelistValue(this.layer, min.val);
      const startWithLabel = i === 0 && (min.val < -100 || reversed || isCodelistValue);
      const isStepWithLabel = startWithLabel || (cumulatedLabelIndicator > labelHeight);

      if (isStepWithLabel) {
        cumulatedLabelIndicator = levelHeight;

        const posY = levelHeight * (linesCount - (reversed ? i + 1 : i)) + topSpacing;
        this.ctx.fillStyle = this.darkGrey;
        this.ctx.fillRect(startX + this.barWidth, posY, 3, 1);

        this.ctx.font = '9px Roboto';
        const value = isCodelistValue
          ? translate(
            (this.layer.codelist[min.val].translate || this.layer.codelist[min.val]) as string,
            this.layer.codelist[min.val].translateParams
          )
          : resolveUnitValue(this.unit, min.val, this.unit.toggle && getToggleKeys(this.unit, this.unitToggle));
        this.ctx.fillText(value, startX + this.barWidth + 5, posY + 4);
      } else {
        cumulatedLabelIndicator += levelHeight;
      }
    });

    // N/A codelist value for season layers
    if (notAvailable) {
      const [minNA] = notAvailable;
      this.ctx.fillStyle = minNA.color;
      this.ctx.fillRect(
        startX,
        topSpacing + levelsHeight + bottomSpacing - levelHeight,
        this.barWidth,
        levelHeight + 1
      );
      this.ctx.fillStyle = this.darkGrey;
      this.ctx.font = '9px Roboto';
      this.ctx.fillText(
        translate('common.misc.n/a'),
        startX +  this.barWidth + 5,
        topSpacing + levelsHeight + bottomSpacing - levelHeight/2 + 2
      );
    }

    // unit label
    this.ctx.fillStyle = this.darkGrey;
    const unitLabel = resolveHtml(this.unit, this.unitToggle, (key, params) => translate(key, params));
    this.ctx.fillText(unitLabel.replace(/<sup>2<\/sup>/g, '²'), startX, levelsHeight + 15);
  }

  renderCodeListLegend(list: GrassFileLegendList): void {
    const linesCount = list.length;

    const bottomSpacing = 15;
    const levelsHeight = (this.ctx.canvas.clientHeight || this.ctx.canvas.height) - bottomSpacing;
    const levelHeight = levelsHeight / linesCount;

    list.reverse();

    list.forEach((line: GrassFileValueColor, i) => {
      const codelistVal = this.layer.codelist[line.val];
      const posY = levelHeight * (linesCount - (i + 1));

      this.ctx.fillStyle = line.color;
      this.ctx.fillRect(0, posY, this.barWidth, levelHeight + 1);

      if (line.color === 'rgb(255, 255, 255)') {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, posY, this.barWidth, levelHeight + 1);
      }

      this.ctx.fillStyle = this.darkGrey;
      this.ctx.font = '9px Roboto';
      const text = translate((codelistVal.translate || codelistVal) as string, codelistVal.translateParams);
      this.ctx.fillText(text, this.barWidth + 5, levelHeight * (linesCount - i) - 2);
    });
  }

  renderAzimuthLegend(list: GrassFileLegendList): void {
    const [quasiFlat, flat, ...slices] = list;
    const width = this.ctx.canvas.clientWidth || this.ctx.canvas.width;
    const bgColor = 'rgb(240, 240, 240)';

    // bg rectangle
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, width, width);

    const slicesCount = slices.length;
    const sliceDeg = 360 / slicesCount;
    let deg = -(90 + sliceDeg / 2); // start angle
    const radians = (rotationDeg: number): number => rotationDeg * Math.PI / 180;

    const center = width / 2;
    const sliceSize = center - 16;

    // color slices/angles
    slices.forEach((angle: [GrassFileValueColor, GrassFileValueColor]) => {
      const [min] = angle;

      this.ctx.beginPath();
      this.ctx.fillStyle = min.color;
      this.ctx.moveTo(center, center);
      this.ctx.arc(center, center, sliceSize, radians(deg), radians(deg + sliceDeg));
      this.ctx.lineTo(center, center);
      this.ctx.fill();

      deg += sliceDeg;
    });

    // cut slices into octagon
    this.ctx.save();
    this.ctx.translate(center, center);
    this.ctx.rotate(radians(22.5));
    this.ctx.beginPath();
    this.ctx.moveTo(sliceSize * Math.cos(0), sliceSize *  Math.sin(0));
    for (let i = 1; i <= slicesCount; i += 1) {
      this.ctx.lineTo(sliceSize * Math.cos(i * 2 * Math.PI / slicesCount), sliceSize * Math.sin(i * 2 * Math.PI / slicesCount));
    }
    this.ctx.lineWidth = width * 0.07; // coef 0.07 to make it 7px for 100px width
    this.ctx.strokeStyle = bgColor;
    this.ctx.stroke();
    this.ctx.restore();

    // directions
    this.ctx.fillStyle = this.darkGrey;
    this.ctx.font = 'bold 14px Roboto';
    this.ctx.fillText('N', center - 4, 16);
    this.ctx.fillText('S', center - 4, width - 6);
    this.ctx.fillText('W', 4, center + 5);
    this.ctx.fillText('E', width - 16, center + 5);

    // sub-directions
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.font = 'bold 10px Roboto';
    this.ctx.fillText('NW', center/2 - 16, center / 2);
    this.ctx.fillText('NE', width - center / 2 - 2, center / 2);
    this.ctx.fillText('SW', center/2 - 16, width - center / 2 + 6);
    this.ctx.fillText('SE', 3 * center/2 - 2, width - center / 2 + 6);

    // flat & quasi-flat triangles
    [flat, quasiFlat].forEach((item: [GrassFileValueColor, GrassFileValueColor], i) => {
      const [min] = item;
      const codelistVal = this.layer.codelist[min.val];

      const spaceX = 8;
      const spaceY = 10;
      const triangleWidth = 16;
      const triangleHeight = 8;
      const startY = width + i * (spaceY + triangleHeight) + spaceY;

      this.ctx.beginPath();
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fillStyle = min.color;
      this.ctx.moveTo(spaceX, startY);
      this.ctx.lineTo(spaceX + triangleWidth, startY + triangleHeight / 2);
      this.ctx.lineTo(spaceX, startY + triangleHeight);
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.fill();

      const text = translate((codelistVal.translate || codelistVal) as string, codelistVal.translateParams);
      this.ctx.fillStyle = this.darkGrey;
      this.ctx.font = '10px Roboto';
      this.ctx.fillText(text.toUpperCase(), spaceX + triangleWidth + 6, startY + triangleHeight - 1);
    });
  }

}
