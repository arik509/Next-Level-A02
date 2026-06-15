import { StatusCodes } from "http-status-codes";

import AppError from "../../utils/AppError";
import type {
  TCreateIssuePayload,
  TIssueType,
} from "./issue.interface";

const validIssueTypes: TIssueType[] = [
  "bug",
  "feature_request",
];

const isObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

export const validateCreateIssuePayload = (
  payload: unknown,
): TCreateIssuePayload => {
  if (!isObject(payload)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid request body",
    );
  }

  const validationErrors: string[] = [];

  const rawTitle = payload.title;
  const rawDescription = payload.description;
  const rawType = payload.type;

  if (
    typeof rawTitle !== "string" ||
    rawTitle.trim().length === 0
  ) {
    validationErrors.push(
      "Title is required",
    );
  } else if (
    rawTitle.trim().length > 150
  ) {
    validationErrors.push(
      "Title must not exceed 150 characters",
    );
  }

  if (
    typeof rawDescription !== "string" ||
    rawDescription.trim().length < 20
  ) {
    validationErrors.push(
      "Description must contain at least 20 characters",
    );
  }

  if (
    typeof rawType !== "string" ||
    !validIssueTypes.includes(
      rawType as TIssueType,
    )
  ) {
    validationErrors.push(
      "Type must be bug or feature_request",
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
    title: (rawTitle as string).trim(),
    description:
      (rawDescription as string).trim(),
    type: rawType as TIssueType,
  };
};