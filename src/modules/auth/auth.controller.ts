import { StatusCodes } from "http-status-codes";
import type {
  Request,
  Response,
} from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";
import {
  validateLoginPayload,
  validateSignupPayload,
} from "./auth.validation";

const signupUser = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const signupPayload =
      validateSignupPayload(
        req.body as unknown,
      );

    const result =
      await authService.signupUserIntoDB(
        signupPayload,
      );

    return sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message:
        "User registered successfully",
      data: result,
    });
  },
);

const loginUser = catchAsync(
  async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const loginPayload =
      validateLoginPayload(
        req.body as unknown,
      );

    const result =
      await authService.loginUserFromDB(
        loginPayload,
      );

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Login successful",
      data: result,
    });
  },
);

export const authController = {
  signupUser,
  loginUser,
};