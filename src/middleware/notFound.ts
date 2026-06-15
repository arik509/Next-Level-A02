import { StatusCodes } from "http-status-codes";
import type {
  NextFunction,
  Request,
  Response,
} from "express";

import AppError from "../utils/AppError";

const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(
      StatusCodes.NOT_FOUND,
      `Route ${req.originalUrl} not found`,
    ),
  );
};

export default notFound;