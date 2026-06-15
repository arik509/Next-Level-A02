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

const isValidJwtPayload = (
  payload: unknown,
): payload is TJwtPayload => {
  if (
    typeof payload !== "object" ||
    payload === null
  ) {
    return false;
  }

  if (
    !("id" in payload) ||
    !("name" in payload) ||
    !("role" in payload)
  ) {
    return false;
  }

  const id = payload.id;
  const name = payload.name;
  const role = payload.role;

  return (
    typeof id === "number" &&
    typeof name === "string" &&
    (
      role === "contributor" ||
      role === "maintainer"
    )
  );
};

const auth = (
  ...requiredRoles: TUserRole[]
): RequestHandler => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    const authorizationHeader =
      req.headers.authorization;

    if (!authorizationHeader) {
      next(
        new AppError(
          StatusCodes.UNAUTHORIZED,
          "Authorization token is required",
        ),
      );

      return;
    }

    const token =
      authorizationHeader.startsWith(
        "Bearer ",
      )
        ? authorizationHeader
            .slice(7)
            .trim()
        : authorizationHeader.trim();

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

      if (
        !isValidJwtPayload(decodedToken)
      ) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          "Invalid token payload",
        );
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
    } catch (error: unknown) {
      if (error instanceof AppError) {
        next(error);
        return;
      }

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