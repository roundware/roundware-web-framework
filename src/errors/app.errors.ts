export class RoundwareFrameworkError extends Error {
  constructor(message: string, ...args: any) {
    super(...args);
    this.message = message;
  }
}

export class MissingArgumentError extends RoundwareFrameworkError {
  constructor(argumentName: string, whileDescription: string, ...args: any) {
    super(
      `Expected argument "${argumentName}" was missing while ${whileDescription}`,
      ...args
    );
  }
}

export class InvalidArgumentError extends RoundwareFrameworkError {
  constructor(
    argumentName: string,
    expected: string,
    whileDescription: string,
    ...args: any
  ) {
    super(
      `Expected argument ${argumentName} to be ${expected} ${whileDescription}`,
      ...args
    );
  }
}
