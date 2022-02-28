import { ensureInRangeWrapped } from './ensure-in-range-wrapped';

describe('ensureInRangeWrapped', () => {
  it(`should return correct number wrapped in positive and negative margin`, () => {
    expect(ensureInRangeWrapped(-100, 180)).toBe(-100);
    expect(ensureInRangeWrapped(100, 180)).toBe(100);
    expect(ensureInRangeWrapped(-200, 180)).toBe(160);
    expect(ensureInRangeWrapped(-220, 180)).toBe(140);
    expect(ensureInRangeWrapped(200, 180)).toBe(-160);
    expect(ensureInRangeWrapped(220, 180)).toBe(-140);
  });
});
