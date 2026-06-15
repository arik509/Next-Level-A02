import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";

import config from "../../config";
import { pool } from "../../db";
import AppError from "../../utils/AppError";
import generateToken from "../../utils/jwt";
import type {
  TDatabaseUser,
  TLoginPayload,
  TLoginResult,
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

const loginUserFromDB = async (
  payload: TLoginPayload,
): Promise<TLoginResult> => {
  const result = await pool.query<TDatabaseUser>(
    `
      SELECT
        id,
        name,
        email,
        password,
        role,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
    `,
    [payload.email],
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  const isPasswordMatched =
    await bcrypt.compare(
      payload.password,
      user.password,
    );

  if (!isPasswordMatched) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  const token = generateToken({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  const publicUser: TPublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return {
    token,
    user: publicUser,
  };
};

export const authService = {
  signupUserIntoDB,
  loginUserFromDB
};