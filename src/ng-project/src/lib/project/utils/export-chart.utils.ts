import { translate } from '@ngneat/transloco';

import { DataLayer } from '@solargis/dataset-core';
import { PvConfig, pvInstalledPower, SystemPvConfig } from '@solargis/types/pv-config';
import {getPrintableTimezone, Timezone} from '@solargis/types/site';
import { ensureArray, isEmpty } from '@solargis/types/utils';
import { installedPowerUnit, resolveHtml, resolveUnitValue } from '@solargis/units';

import { MimeType } from 'ng-shared/shared/utils/download.utils';

export function exportImageProjectDesc(
  projectName: string,
  layers: DataLayer | DataLayer[],
  pvConfig?: SystemPvConfig,
  timezone?: Timezone
): string {
  let pvConfigDesc = '';

  if (pvConfig) {
    const hasLayer = (key: string): boolean => ensureArray(layers || []).some(l => l.key === key);
    const hasPVOUTspecific: boolean = hasLayer('PVOUT_specific');
    const hasPVOUTtotal: boolean = hasLayer('PVOUT_total');

    if (hasPVOUTspecific || hasPVOUTtotal) {
      const pvConfigTypeDesc = translate(`pvConfig.type.${pvConfig.type}.name`);
      const installedPower = pvInstalledPower(pvConfig);
      const pvoutDesc = hasPVOUTtotal
        ? ', ' + resolveUnitValue(installedPowerUnit, installedPower) + translate(resolveHtml(installedPowerUnit, {}, str => str))
        : '';
      pvConfigDesc = ', ' + pvConfigTypeDesc + pvoutDesc;
    }
  }

  const timezoneDesc = timezone ? `, ${getPrintableTimezone(timezone, translate('project.timezone.dstNotConsidered'))}` : '';

  return projectName + pvConfigDesc + timezoneDesc;
}

export function translateLayersTitle(layers: DataLayer | DataLayer[]): string {
  return ensureArray(layers)
    .map(l => translate(l.name.translate as string, l.name.translateParams))
    .join(' + ');
}

export function canvasWithFooterToDataURL(
  oldCanvas: HTMLCanvasElement,
  layers: DataLayer | DataLayer[],
  projectName: string | string[],
  pvConfig?: PvConfig | PvConfig[],
  timezone?: Timezone | Timezone[],
  imageTitle: string = ''
): string {
  const newCanvas = document.createElement('canvas');
  const ctx = newCanvas.getContext('2d');
  const year = (new Date()).getFullYear();
  const hasMultipleProjects = Array.isArray(projectName);

  const title = layers && !isEmpty(layers) ? translateLayersTitle(layers) : translate(imageTitle);

  newCanvas.width = oldCanvas.width + 30;
  newCanvas.height = oldCanvas.height + 90 + (hasMultipleProjects ? 10 * (projectName as string[]).length : 0);

  // copy canvas
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
  ctx.drawImage(oldCanvas, 15, 60);

  // title
  ctx.font = 'bold 22px Roboto';
  ctx.fillStyle = '#666666';
  ctx.textAlign = 'center';
  ctx.fillText(title, newCanvas.width / 2, 40);

  // description
  ctx.font = '12px Roboto';
  ctx.textAlign = 'left';
  if (hasMultipleProjects) {
    (projectName as string[]).forEach((name, i) => {
      const projectDesc = exportImageProjectDesc(name, layers, pvConfig[i] as SystemPvConfig, timezone[i]);
      ctx.fillText(projectDesc, 15, newCanvas.height - 8 - (i * 16));
    });
  } else {
    const projectDesc = exportImageProjectDesc(projectName as string, layers, pvConfig as SystemPvConfig, timezone as Timezone);
    ctx.fillText(projectDesc, 15, newCanvas.height - 8);
  }

  // copyright
  ctx.textAlign = 'right';
  ctx.fillText(`© ${year} Solargis`, newCanvas.width - 15, newCanvas.height - 8);

  return newCanvas.toDataURL(MimeType.PNG);
}

