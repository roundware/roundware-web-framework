import { GENERIC_ERROR_MSG } from './errors';

describe('Error Constants', () => {
  test('GENERIC_ERROR_MSG should have the correct error message', () => {
    expect(GENERIC_ERROR_MSG).toBe('We were unable to contact the audio server, please try again.');
  });

  test('GENERIC_ERROR_MSG should be a string', () => {
    expect(typeof GENERIC_ERROR_MSG).toBe('string');
  });

  test('GENERIC_ERROR_MSG should not be empty', () => {
    expect(GENERIC_ERROR_MSG.length).toBeGreaterThan(0);
  });
});
