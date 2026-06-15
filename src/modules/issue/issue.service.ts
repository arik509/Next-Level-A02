import { StatusCodes } from "http-status-codes";

import { pool } from "../../db";
import AppError from "../../utils/AppError";
import type { TJwtPayload } from "../auth/auth.interface";
import type {
  TCreateIssuePayload,
  TIssue,
  TIssueQuery,
  TIssueReporter,
  TIssueWithReporter,
  TUpdateIssuePayload,
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


const getAllIssuesFromDB = async (
  query: TIssueQuery,
): Promise<TIssueWithReporter[]> => {
  const conditions: string[] = [];
  const values: string[] = [];

  if (query.type) {
    values.push(query.type);

    conditions.push(
      `type = $${values.length}`,
    );
  }

  if (query.status) {
    values.push(query.status);

    conditions.push(
      `status = $${values.length}`,
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const orderDirection =
    query.sort === "oldest"
      ? "ASC"
      : "DESC";

  const issueResult =
    await pool.query<TIssue>(
      `
        SELECT
          id,
          title,
          description,
          type,
          status,
          reporter_id,
          created_at,
          updated_at
        FROM issues
        ${whereClause}
        ORDER BY
          created_at ${orderDirection},
          id ${orderDirection}
      `,
      values,
    );

  const issues = issueResult.rows;

  if (issues.length === 0) {
    return [];
  }

  const reporterIds = [
    ...new Set(
      issues.map(
        (issue) => issue.reporter_id,
      ),
    ),
  ];

  const reporterResult =
    await pool.query<TIssueReporter>(
      `
        SELECT
          id,
          name,
          role
        FROM users
        WHERE id = ANY($1::int[])
      `,
      [reporterIds],
    );

  const reporterMap = new Map<
    number,
    TIssueReporter
  >();

  reporterResult.rows.forEach(
    (reporter) => {
      reporterMap.set(
        reporter.id,
        reporter,
      );
    },
  );

  return issues.map((issue) => {
    const reporter = reporterMap.get(
      issue.reporter_id,
    );

    if (!reporter) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        `Reporter information not found for issue ${issue.id}`,
      );
    }

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });
};

const getSingleIssueFromDB = async (
  issueId: number,
): Promise<TIssueWithReporter> => {
  const issueResult =
    await pool.query<TIssue>(
      `
        SELECT
          id,
          title,
          description,
          type,
          status,
          reporter_id,
          created_at,
          updated_at
        FROM issues
        WHERE id = $1
      `,
      [issueId],
    );

  const issue = issueResult.rows[0];

  if (!issue) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Issue not found",
    );
  }

  const reporterResult =
    await pool.query<TIssueReporter>(
      `
        SELECT
          id,
          name,
          role
        FROM users
        WHERE id = $1
      `,
      [issue.reporter_id],
    );

  const reporter = reporterResult.rows[0];

  if (!reporter) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Reporter information not found",
    );
  }

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};


const updateIssueIntoDB = async (
  issueId: number,
  payload: TUpdateIssuePayload,
  requester: TJwtPayload,
): Promise<TIssue> => {
  const existingIssueResult =
    await pool.query<TIssue>(
      `
        SELECT
          id,
          title,
          description,
          type,
          status,
          reporter_id,
          created_at,
          updated_at
        FROM issues
        WHERE id = $1
      `,
      [issueId],
    );

  const existingIssue =
    existingIssueResult.rows[0];

  if (!existingIssue) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Issue not found",
    );
  }

  const isMaintainer =
    requester.role === "maintainer";

  if (!isMaintainer) {
    if (
      existingIssue.reporter_id !==
      requester.id
    ) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You can update only your own issues",
      );
    }

    if (
      existingIssue.status !== "open"
    ) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "Only open issues can be updated by contributors",
      );
    }

    if (payload.status !== undefined) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Contributors cannot update issue status",
      );
    }
  }

  const setClauses: string[] = [];
  const values: Array<string | number> = [];

  if (payload.title !== undefined) {
    values.push(payload.title);

    setClauses.push(
      `title = $${values.length}`,
    );
  }

  if (payload.description !== undefined) {
    values.push(payload.description);

    setClauses.push(
      `description = $${values.length}`,
    );
  }

  if (payload.type !== undefined) {
    values.push(payload.type);

    setClauses.push(
      `type = $${values.length}`,
    );
  }

  if (payload.status !== undefined) {
    values.push(payload.status);

    setClauses.push(
      `status = $${values.length}`,
    );
  }

  if (setClauses.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "At least one update field is required",
    );
  }

  values.push(issueId);

  const result = await pool.query<TIssue>(
    `
      UPDATE issues
      SET ${setClauses.join(", ")}
      WHERE id = $${values.length}
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
    values,
  );

  const updatedIssue = result.rows[0];

  if (!updatedIssue) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update issue",
    );
  }

  return updatedIssue;
};


export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
};