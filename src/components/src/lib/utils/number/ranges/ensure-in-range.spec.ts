import { ensureInRange } from './ensure-in-range';

describe('ensureInRange', () => {
  it(`should return correct number`, () => {
    expect(ensureInRange(0, 24)).toBe(0);
    expect(ensureInRange(15, 24)).toBe(15);
    expect(ensureInRange(39, 24)).toBe(15);
    expect(ensureInRange(-15, 24)).toBe(9);
  });
});
