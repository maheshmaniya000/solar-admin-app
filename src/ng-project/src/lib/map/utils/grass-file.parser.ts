export type GrassFileValueColor = {
  val: number;
  color: string;
};

export type GrassFileLegendList = (GrassFileValueColor | [GrassFileValueColor, GrassFileValueColor])[];

export type GrassFileLegend = GrassFileLegendList[];

export class GrassFileParser {

  // FIXME this is not very nice solution - specific hacks
  private handleSpecialCases(grassFile: string, layerKey: string): string {
    if (layerKey === 'CDD' || layerKey === 'HDD') {
      grassFile = grassFile.replace(/0.01:/gm, '0:');
    }
    if (layerKey === 'SNOWD') {
      grassFile = grassFile.replace(/0.1:/gm, '1:');
    }
    if (layerKey === 'ELE') {
      grassFile = grassFile.replace(/(-1450:|0:.*1000:).*\n/gm, '');
    }
    return grassFile;
  }

  private valueColorParser(expression: string): GrassFileValueColor {
    const [val, r, g, b] = expression.split(':').map(x => parseFloat(x));
    return { val, color: `rgb(${r}, ${g}, ${b})` };
  }

  parse(grassFile: string, layerKey: string): GrassFileLegend {
    grassFile = grassFile.replace(/^\s*[\r\n\\n]/gm, '');
    grassFile = this.handleSpecialCases(grassFile, layerKey);

    const lists = grassFile.split('\n%');

    return lists.map(list => {
      const lines: string[] = list.split('\n');
      lines.splice(0, 1);
      lines.splice(-1, 1);

      const rangeSeparator = ' ';
      const isNotCodeList = lines[0].includes(rangeSeparator);

      return lines.map(line => {
        if (isNotCodeList) { // range
          const [min, max] = line.split(rangeSeparator).map(val => this.valueColorParser(val));
          return [min, max];
        } else { // codelist
          return this.valueColorParser(line);
        }
      });
    });
  }

}
