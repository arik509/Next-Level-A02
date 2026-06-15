import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";

import config from "../../config";
import { pool } from "../../db";
import AppError from "../../utils/AppError";
import type {
  TPublicUser,
  TSignupPayload,
} from "./auth.interface";

const isPostgresError = (
  error: unknown,
): error is { code: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
};

const signupUserIntoDB = async (
  payload: TSignupPayload,
): Promise<TPublicUser> => {
  const existingUser = await pool.query<{
    id: number;
  }>(
    `
      SELECT id
      FROM users
      WHERE email = $1
    `,
    [payload.email],
  );

  if (existingUser.rowCount !== null &&
      existingUser.rowCount > 0) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "User with this email already exists",
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds,
  );

  try {
    const result = await pool.query<TPublicUser>(
      `
        INSERT INTO users (
          name,
          email,
          password,
          role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          name,
          email,
          role,
          created_at,
          updated_at
      `,
      [
        payload.name,
        payload.email,
        hashedPassword,
        payload.role,
      ],
    );

    const createdUser = result.rows[0];

    if (!createdUser) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to register user",
      );
    }

    return createdUser;
  } catch (error: unknown) {
    if (
      isPostgresError(error) &&
      error.code === "23505"
    ) {
      throw new AppError(
        StatusCodes.CONFLICT,
        "User with this email already exists",
      );
    }

    throw error;
  }
};

export const authService = {
  signupUserIntoDB,
};