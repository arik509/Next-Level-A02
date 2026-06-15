class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: unknown;

  constructor(
    statusCode: number,
    message: string,
    errors?: unknown,
  ) {
    super(message);

    this.statusCode = statusCode;

    if (errors !== undefined) {
      this.errors = errors;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;