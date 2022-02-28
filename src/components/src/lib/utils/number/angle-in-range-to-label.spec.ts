import { angleInRangeToLabel } from './angle-in-range-to-label';

describe('angleInRangeToLabel', () => {
  const mainCardinalCoords = ['N', 'E', 'S', 'W'];
  it('should return correct cardinal direction label for every quarter of a circle including ranges outside +/- 360 degrees', () => {
    expect(angleInRangeToLabel(0, mainCardinalCoords)).toEqual('N');
    expect(angleInRangeToLabel(90, mainCardinalCoords)).toEqual('E');
    expect(angleInRangeToLabel(180, mainCardinalCoords)).toEqual('S');
    expect(angleInRangeToLabel(270, mainCardinalCoords)).toEqual('W');
    expect(angleInRangeToLabel(360, mainCardinalCoords)).toEqual('N');
    expect(angleInRangeToLabel(450, mainCardinalCoords)).toEqual('E');
    expect(angleInRangeToLabel(540, mainCardinalCoords)).toEqual('S');
    expect(angleInRangeToLabel(630, mainCardinalCoords)).toEqual('W');
    expect(angleInRangeToLabel(-90, mainCardinalCoords)).toEqual('W');
    expect(angleInRangeToLabel(-180, mainCardinalCoords)).toEqual('S');
    expect(angleInRangeToLabel(-270, mainCardinalCoords)).toEqual('E');
  });

  it('should return correct cardinal direction label for every quarter of a circle shifted by 45 degrees', () => {
    expect(angleInRangeToLabel(-45, mainCardinalCoords)).toEqual('N');
    expect(angleInRangeToLabel(44, mainCardinalCoords)).toEqual('N');
    expect(angleInRangeToLabel(90 - 45, mainCardinalCoords)).toEqual('E');
    expect(angleInRangeToLabel(90 + 44, mainCardinalCoords)).toEqual('E');
    expect(angleInRangeToLabel(180 - 45, mainCardinalCoords)).toEqual('S');
    expect(angleInRangeToLabel(180 + 44, mainCardinalCoords)).toEqual('S');
    expect(angleInRangeToLabel(270 - 45, mainCardinalCoords)).toEqual('W');
    expect(angleInRangeToLabel(270 + 44, mainCardinalCoords)).toEqual('W');
  });

  it('should return correct cardinal and intercardinal direction label for every eighth of a circle', () => {
    expect(angleInRangeToLabel(-22)).toEqual('N');
    expect(angleInRangeToLabel(22)).toEqual('N');
    expect(angleInRangeToLabel(24)).toEqual('NE');
    expect(angleInRangeToLabel(45)).toEqual('NE');
    expect(angleInRangeToLabel(67)).toEqual('NE');
    expect(angleInRangeToLabel(69)).toEqual('E');
    expect(angleInRangeToLabel(90)).toEqual('E');
    expect(angleInRangeToLabel(112)).toEqual('E');
  });
});
