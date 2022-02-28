import { ensureIndexInArrayBounds } from './ensure-index-in-array-bounds';

describe('ensureIndexInArrayBounds', () => {
  it(`should return correct number`, () => {
    expect(ensureIndexInArrayBounds(0, 4)).toBe(0);
    expect(ensureIndexInArrayBounds(2, 4)).toBe(2);
    expect(ensureIndexInArrayBounds(-1, 4)).toBe(3);
    expect(ensureIndexInArrayBounds(4, 4)).toBe(0);
  });
});
