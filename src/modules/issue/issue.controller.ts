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

export const issueController = {
  createIssue,
};