import { StatusCodes } from "http-status-codes";
import type {
  NextFunction,
  Request,
  Response,
} from "express";

import AppError from "../utils/AppError";

const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors !== undefined && {
        errors: error.errors,
      }),
    });
  }

  console.error("Unhandled error:", error);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal server error",
  });
};

export default globalErrorHandler;