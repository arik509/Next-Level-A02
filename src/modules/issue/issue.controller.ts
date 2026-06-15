import type {
  Request,
  Response,
} from "express";
import { StatusCodes } from "http-status-codes";

import AppError from "../../utils/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";
import {
  validateCreateIssuePayload,
  validateIssueId,
  validateIssueQuery,
} from "./issue.validation";


const createIssue = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "Authenticated user information is missing",
      );
    }

    const issuePayload =
      validateCreateIssuePayload(
        req.body as unknown,
      );

    const result =
      await issueService.createIssueIntoDB(
        issuePayload,
        req.user.id,
      );

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  },
);

const getAllIssues = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const query =
      validateIssueQuery(
        req.query as unknown,
      );

    const result =
      await issueService.getAllIssuesFromDB(
        query,
      );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message:
        "Issues retrived successfully",
      data: result,
    });
  },
);

const getSingleIssue = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const issueId = validateIssueId(
      req.params.id,
    );

    const result =
      await issueService.getSingleIssueFromDB(
        issueId,
      );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message:
        "Issue retrived successfully",
      data: result,
    });
  },
);

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
};