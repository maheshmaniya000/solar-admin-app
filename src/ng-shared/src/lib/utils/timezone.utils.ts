import * as moment from 'moment';

import { TimezoneData } from '@solargis/sg-charts/dist/main/Timezone'; // FIXME bad import
import { Timezone } from '@solargis/types/site';

export function printTimezone(timezone: Timezone): string {
  if (timezone) {
    const { zoneName, abbreviation } = timezone;
    return zoneName ? `${zoneName} [${abbreviation}]` : abbreviation;
  }
}

export function toTimezoneData(timezone: Timezone): TimezoneData {
  if (!timezone) {return undefined;}

  const tzData: TimezoneData = {
    name: printTimezone(timezone),
    abbr: timezone.abbreviation,
    offset: timezone.gmtOffset / 60
  };
  if (timezone.dst) {
    const startDay = moment.unix(timezone.dst.start).dayOfYear();
    const endDay = moment.unix(timezone.dst.end).dayOfYear();
    tzData.dst = {
      abbr: timezone.dst.abbreviation,
      offset: (timezone.dst.gmtOffset) / 60,
      firstDstDayOfYear: startDay,
      firstNonDstDayOfYear: endDay + 1
    };
  }
  return tzData;
}


