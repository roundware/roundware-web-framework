export class RoundwareFrameworkError extends Error {
  constructor(message: string, ...args: any) {
    super(...args);
    this.message = message;
  }
}

export class MissingArgumentError extends RoundwareFrameworkError {
  constructor(
    argumentName: string,
    whileDescription: string,
    expectedType: string,
    ...args: any
  ) {
    super(
      `Expected argument "${argumentName}" was missing or invalid while ${whileDescription}. Please pass ${argumentName} of type "${expectedType}" while ${whileDescription}`,
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
      `Expected argument "${argumentName}" to be "${expected}" while ${whileDescription}`,
      ...args
    );
  }
}

export class RoundwareConnectionError extends RoundwareFrameworkError {
  constructor(additonalContext?: string, ...args: any) {
    super(
      `${
        additonalContext ? additonalContext + " " : ""
      }Sorry, we were unable to connect to Roundware. Please try again.`,
      ...args
    );
  }
}
