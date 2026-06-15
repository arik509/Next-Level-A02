import { StatusCodes } from "http-status-codes";

import AppError from "../../utils/AppError";
import type {
  TLoginPayload,
  TSignupPayload,
  TUserRole,
} from "./auth.interface";

const validRoles: TUserRole[] = [
  "contributor",
  "maintainer",
];

const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

export const validateSignupPayload = (
  payload: unknown,
): TSignupPayload => {
  if (!isObject(payload)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid request body",
    );
  }

  const validationErrors: string[] = [];

  const rawName = payload.name;
  const rawEmail = payload.email;
  const rawPassword = payload.password;
  const rawRole = payload.role;

  if (
    typeof rawName !== "string" ||
    rawName.trim().length === 0
  ) {
    validationErrors.push("Name is required");
  }

  if (
    typeof rawEmail !== "string" ||
    !emailPattern.test(rawEmail.trim())
  ) {
    validationErrors.push(
      "A valid email address is required",
    );
  }

  if (
    typeof rawPassword !== "string" ||
    rawPassword.length === 0
  ) {
    validationErrors.push("Password is required");
  }

  if (
    rawRole !== undefined &&
    (
      typeof rawRole !== "string" ||
      !validRoles.includes(rawRole as TUserRole)
    )
  ) {
    validationErrors.push(
      "Role must be contributor or maintainer",
    );
  }

  if (validationErrors.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Validation failed",
      validationErrors,
    );
  }

  return {
    name: (rawName as string).trim(),
    email: (rawEmail as string).trim().toLowerCase(),
    password: rawPassword as string,
    role:
      rawRole === "maintainer"
        ? "maintainer"
        : "contributor",
  };
};

export const validateLoginPayload = (
  payload: unknown,
): TLoginPayload => {
  if (!isObject(payload)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid request body",
    );
  }

  const validationErrors: string[] = [];

  const rawEmail = payload.email;
  const rawPassword = payload.password;

  if (
    typeof rawEmail !== "string" ||
    !emailPattern.test(rawEmail.trim())
  ) {
    validationErrors.push(
      "A valid email address is required",
    );
  }

  if (
    typeof rawPassword !== "string" ||
    rawPassword.length === 0
  ) {
    validationErrors.push("Password is required");
  }

  if (validationErrors.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Validation failed",
      validationErrors,
    );
  }

  return {
    email: (rawEmail as string)
      .trim()
      .toLowerCase(),

    password: rawPassword as string,
  };
};

