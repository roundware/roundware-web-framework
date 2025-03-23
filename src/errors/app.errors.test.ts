import { RoundwareFrameworkError, MissingArgumentError, InvalidArgumentError, RoundwareConnectionError } from './app.errors';

describe('RoundwareFrameworkError', () => {
  test('creates error with correct message', () => {
    const error = new RoundwareFrameworkError('Test error message');
    expect(error.message).toBe('Test error message');
  });
});

describe('MissingArgumentError', () => {
  test('formats error message correctly', () => {
    const error = new MissingArgumentError(
      'userId',
      'creating user profile',
      'string'
    );
    expect(error.message).toBe(
      'Expected argument "userId" was missing or invalid while creating user profile. Please pass userId of type "string" while creating user profile'
    );
  });
});

describe('InvalidArgumentError', () => {
  test('formats error message correctly', () => {
    const error = new InvalidArgumentError(
      'status',
      'active',
      'updating user status'
    );
    expect(error.message).toBe(
      'Expected argument "status" to be "active" while updating user status'
    );
  });
});

describe('RoundwareConnectionError', () => {
  test('creates basic error message', () => {
    const error = new RoundwareConnectionError();
    expect(error.message).toBe(
      'Sorry, we were unable to connect to Roundware. Please try again.'
    );
  });

  test('includes additional context in error message', () => {
    const error = new RoundwareConnectionError('Network timeout occurred');
    expect(error.message).toBe(
      'Network timeout occurred Sorry, we were unable to connect to Roundware. Please try again.'
    );
  });
});
