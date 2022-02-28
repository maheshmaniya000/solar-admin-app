import { GrassFileLegend, GrassFileParser, GrassFileValueColor } from './grass-file.parser';

describe('GrassFileParser', () => {
  const parser = new GrassFileParser();

  const getFile = (fileName: string): string => require(`../controls/map-legend-canvas/grass/${fileName}.grass`);

  const getColorFromRgb = (color: string): string => /rgb\((.*)\)/g.exec(color)[1].split(', ').join(':');

  const getFirstItemLegend = (lists: GrassFileLegend[]): string => {
    const firstItem = lists[0][0];
    const valueColorString = (valColor: GrassFileValueColor): string => `${valColor.val}:${getColorFromRgb(valColor.color)}`;
    return Array.isArray(firstItem)
      ? firstItem.map((item: GrassFileValueColor) => valueColorString(item)).join(' ')
      : valueColorString(firstItem);
  };

  it('ELE', () => {
    const grassFile = getFile('terrain_elevation_global');
    const lists = parser.parse(grassFile, 'ELE');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('PVOUT_csi', () => {
    const grassFile = getFile('pvout_csi_global');
    const lists = parser.parse(grassFile, 'PVOUT_csi');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('GHI', () => {
    const grassFile = getFile('ghi_global');
    const lists = parser.parse(grassFile, 'GHI');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('DNI', () => {
    const grassFile = getFile('dni_global');
    const lists = parser.parse(grassFile, 'DNI');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('D2G', () => {
    const grassFile = getFile('d2g_global');
    const lists = parser.parse(grassFile, 'D2G');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('GTI_opta', () => {
    const grassFile = getFile('gti_opta_global');
    const lists = parser.parse(grassFile, 'GTI_opta');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('OPTA', () => {
    const grassFile = getFile('opta_global');
    const lists = parser.parse(grassFile, 'OPTA');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('GHI_season', () => {
    const grassFile = getFile('ghi_season_global');
    const lists = parser.parse(grassFile, 'GHI_season');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('DNI_season', () => {
    const grassFile = getFile('dni_season_global');
    const lists = parser.parse(grassFile, 'DNI_season');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('ALB', () => {
    const grassFile = getFile('albedo_global');
    const lists = parser.parse(grassFile, 'ALB');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('TEMP', () => {
    const grassFile = getFile('temp_global');
    const lists = parser.parse(grassFile, 'TEMP');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('WS', () => {
    const grassFile = getFile('ws_global');
    const lists = parser.parse(grassFile, 'WS');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('RH', () => {
    const grassFile = getFile('rh_global');
    const lists = parser.parse(grassFile, 'RH');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('PWAT', () => {
    const grassFile = getFile('pwat_global');
    const lists = parser.parse(grassFile, 'PWAT');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('PREC', () => {
    const grassFile = getFile('precip_global');
    const lists = parser.parse(grassFile, 'PREC');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('SNOWD', () => {
    const grassFile = getFile('sdwe_global');
    const lists = parser.parse(grassFile, 'SNOWD');
    expect(getFirstItemLegend(lists as any)).toBe('-1:253:229:255 1:253:229:255');
  });

  it('CDD', () => {
    const grassFile = getFile('deg_day_cool_global');
    const lists = parser.parse(grassFile, 'CDD');
    expect(grassFile.replace('0.01', '0')).toContain(getFirstItemLegend(lists as any));
  });

  it('HDD', () => {
    const grassFile = getFile('deg_day_heat_global');
    const lists = parser.parse(grassFile, 'HDD');
    expect(grassFile.replace('0.01', '0')).toContain(getFirstItemLegend(lists as any));
  });

  it('POPUL', () => {
    const grassFile = getFile('population_global');
    const lists = parser.parse(grassFile, 'POPUL');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('SLO', () => {
    const grassFile = getFile('terrain_slope_global');
    const lists = parser.parse(grassFile, 'SLO');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('AZI', () => {
    const grassFile = getFile('terrain_aspect_global');
    const lists = parser.parse(grassFile, 'AZI');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });

  it('LANDC', () => {
    const grassFile = getFile('landcover_global');
    const lists = parser.parse(grassFile, 'LANDC');
    expect(grassFile).toContain(getFirstItemLegend(lists as any));
  });
});
