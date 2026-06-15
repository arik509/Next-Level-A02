import { StatusCodes } from "http-status-codes";

import { pool } from "../../db";
import AppError from "../../utils/AppError";
import type {
  TCreateIssuePayload,
  TIssue,
} from "./issue.interface";

const createIssueIntoDB = async (
  payload: TCreateIssuePayload,
  reporterId: number,
): Promise<TIssue> => {
  const reporterResult =
    await pool.query<{ id: number }>(
      `
        SELECT id
        FROM users
        WHERE id = $1
      `,
      [reporterId],
    );

  const reporter =
    reporterResult.rows[0];

  if (!reporter) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Authenticated user does not exist",
    );
  }

  const result = await pool.query<TIssue>(
    `
      INSERT INTO issues (
        title,
        description,
        type,
        reporter_id
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        title,
        description,
        type,
        status,
        reporter_id,
        created_at,
        updated_at
    `,
    [
      payload.title,
      payload.description,
      payload.type,
      reporterId,
    ],
  );

  const createdIssue = result.rows[0];

  if (!createdIssue) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create issue",
    );
  }

  return createdIssue;
};

export const issueService = {
  createIssueIntoDB,
};