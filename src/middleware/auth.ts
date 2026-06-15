import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import config from "../config";
import type {
  TJwtPayload,
  TUserRole,
} from "../modules/auth/auth.interface";
import AppError from "../utils/AppError";

const isObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const isValidJwtPayload = (
  payload: unknown,
): payload is TJwtPayload => {
  if (!isObject(payload)) {
    return false;
  }

  return (
    typeof payload.id === "number" &&
    typeof payload.name === "string" &&
    (
      payload.role === "contributor" ||
      payload.role === "maintainer"
    )
  );
};

const extractToken = (
  authorizationHeader: string | undefined,
): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const trimmedHeader =
    authorizationHeader.trim();

  if (
    trimmedHeader
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    const bearerToken =
      trimmedHeader.slice(7).trim();

    return bearerToken || null;
  }

  return trimmedHeader || null;
};

const auth = (
  ...requiredRoles: TUserRole[]
): RequestHandler => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    const token = extractToken(
      req.headers.authorization,
    );

    if (!token) {
      next(
        new AppError(
          StatusCodes.UNAUTHORIZED,
          "Authorization token is required",
        ),
      );

      return;
    }

    try {
      const decodedToken = jwt.verify(
        token,
        config.jwt_secret,
      );

      if (!isValidJwtPayload(decodedToken)) {
        next(
          new AppError(
            StatusCodes.UNAUTHORIZED,
            "Invalid token payload",
          ),
        );

        return;
      }

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.includes(
          decodedToken.role,
        )
      ) {
        next(
          new AppError(
            StatusCodes.FORBIDDEN,
            "You do not have permission to perform this action",
          ),
        );

        return;
      }

      req.user = {
        id: decodedToken.id,
        name: decodedToken.name,
        role: decodedToken.role,
      };

      next();
    } catch {
      next(
        new AppError(
          StatusCodes.UNAUTHORIZED,
          "Invalid or expired token",
        ),
      );
    }
  };
};

export default auth;