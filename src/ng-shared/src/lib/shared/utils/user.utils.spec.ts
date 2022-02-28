import { userFullName } from './user.utils';

describe('userFullName', () => {
  it('should return empty string for undefined', () => {
    expect(userFullName(undefined)).toBe('');
  });

  it('should return empty string for null', () => {
    expect(userFullName(null)).toBe('');
  });

  it('should return full user name', () => {
    expect(userFullName({ firstName: 'Manuel', lastName: 'Banano' })).toBe('Manuel Banano');
  });

  it('should return last name when first name is undefined/null/empty', () => {
    expect(userFullName({ lastName: 'Banano' })).toBe('Banano');
    expect(userFullName({ firstName: undefined, lastName: 'Banano' })).toBe('Banano');
    expect(userFullName({ firstName: null, lastName: 'Banano' })).toBe('Banano');
    expect(userFullName({ firstName: '', lastName: 'Banano' })).toBe('Banano');
  });

  it('should return first name when last name is undefined/null/empty', () => {
    expect(userFullName({ firstName: 'Manuel' })).toBe('Manuel');
    expect(userFullName({ firstName: 'Manuel', lastName: undefined })).toBe('Manuel');
    expect(userFullName({ firstName: 'Manuel', lastName: null })).toBe('Manuel');
    expect(userFullName({ firstName: 'Manuel', lastName: '' })).toBe('Manuel');
  });
});
