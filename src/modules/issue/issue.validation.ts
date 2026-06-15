import { StatusCodes } from "http-status-codes";

import AppError from "../../utils/AppError";
import type { TUserRole } from "../auth/auth.interface";
import type {
  TCreateIssuePayload,
  TIssueQuery,
  TIssueSort,
  TIssueStatus,
  TIssueType,
  TUpdateIssuePayload,
} from "./issue.interface";

const allowedUpdateFields = [
  "title",
  "description",
  "type",
  "status",
] as const;


const validIssueTypes: TIssueType[] = [
  "bug",
  "feature_request",
];

const validIssueStatuses: TIssueStatus[] = [
  "open",
  "in_progress",
  "resolved",
];

const validSortValues: TIssueSort[] = [
  "newest",
  "oldest",
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

export const validateIssueQuery = (
  query: unknown,
): TIssueQuery => {
  if (!isObject(query)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid query parameters",
    );
  }

  const rawSort = query.sort;
  const rawType = query.type;
  const rawStatus = query.status;

  const validationErrors: string[] = [];

  if (
    rawSort !== undefined &&
    (
      typeof rawSort !== "string" ||
      !validSortValues.includes(
        rawSort as TIssueSort,
      )
    )
  ) {
    validationErrors.push(
      "Sort must be newest or oldest",
    );
  }

  if (
    rawType !== undefined &&
    (
      typeof rawType !== "string" ||
      !validIssueTypes.includes(
        rawType as TIssueType,
      )
    )
  ) {
    validationErrors.push(
      "Type must be bug or feature_request",
    );
  }

  if (
    rawStatus !== undefined &&
    (
      typeof rawStatus !== "string" ||
      !validIssueStatuses.includes(
        rawStatus as TIssueStatus,
      )
    )
  ) {
    validationErrors.push(
      "Status must be open, in_progress, or resolved",
    );
  }

  if (validationErrors.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid query parameters",
      validationErrors,
    );
  }

  const validatedQuery: TIssueQuery = {
    sort:
      rawSort === "oldest"
        ? "oldest"
        : "newest",
  };

  if (rawType !== undefined) {
    validatedQuery.type =
      rawType as TIssueType;
  }

  if (rawStatus !== undefined) {
    validatedQuery.status =
      rawStatus as TIssueStatus;
  }

  return validatedQuery;
};

export const validateIssueId = (
  rawId: unknown,
): number => {
  if (
    typeof rawId !== "string" ||
    !/^[1-9]\d*$/.test(rawId)
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Issue ID must be a positive integer",
    );
  }

  const issueId = Number(rawId);

  if (!Number.isSafeInteger(issueId)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Issue ID must be a valid integer",
    );
  }

  return issueId;
};

export const validateUpdateIssuePayload = (
  payload: unknown,
  userRole: TUserRole,
): TUpdateIssuePayload => {
  if (!isObject(payload)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid request body",
    );
  }

  const submittedFields = Object.keys(payload);

  if (submittedFields.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "At least one update field is required",
    );
  }

  const unknownFields = submittedFields.filter(
    (field) =>
      !allowedUpdateFields.includes(
        field as (typeof allowedUpdateFields)[number],
      ),
  );

  if (unknownFields.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid update fields",
      unknownFields.map(
        (field) => `${field} cannot be updated`,
      ),
    );
  }

  if (
    userRole === "contributor" &&
    "status" in payload
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Contributors cannot update issue status",
    );
  }

  const validationErrors: string[] = [];

  const rawTitle = payload.title;
  const rawDescription = payload.description;
  const rawType = payload.type;
  const rawStatus = payload.status;

  if (rawTitle !== undefined) {
    if (
      typeof rawTitle !== "string" ||
      rawTitle.trim().length === 0
    ) {
      validationErrors.push(
        "Title must be a non-empty string",
      );
    } else if (
      rawTitle.trim().length > 150
    ) {
      validationErrors.push(
        "Title must not exceed 150 characters",
      );
    }
  }

  if (rawDescription !== undefined) {
    if (
      typeof rawDescription !== "string" ||
      rawDescription.trim().length < 20
    ) {
      validationErrors.push(
        "Description must contain at least 20 characters",
      );
    }
  }

  if (rawType !== undefined) {
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
  }

  if (rawStatus !== undefined) {
    if (
      typeof rawStatus !== "string" ||
      !validIssueStatuses.includes(
        rawStatus as TIssueStatus,
      )
    ) {
      validationErrors.push(
        "Status must be open, in_progress, or resolved",
      );
    }
  }

  if (validationErrors.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Validation failed",
      validationErrors,
    );
  }

  const validatedPayload: TUpdateIssuePayload = {};

  if (rawTitle !== undefined) {
    validatedPayload.title =
      (rawTitle as string).trim();
  }

  if (rawDescription !== undefined) {
    validatedPayload.description =
      (rawDescription as string).trim();
  }

  if (rawType !== undefined) {
    validatedPayload.type =
      rawType as TIssueType;
  }

  if (rawStatus !== undefined) {
    validatedPayload.status =
      rawStatus as TIssueStatus;
  }

  return validatedPayload;
};