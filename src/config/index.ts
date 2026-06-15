import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const getRequiredEnvironmentVariable = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not defined in the .env file`);
  }

  return value;
};

const config = {
  connection_string: getRequiredEnvironmentVariable("CONNECTION_STRING"),
  port: Number(process.env.PORT) || 5000,

  jwt_secret: getRequiredEnvironmentVariable("JWT_SECRET"),
  jwt_expires_in: process.env.JWT_EXPIRES_IN ?? "7d",

  bcrypt_salt_rounds:
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

  node_env: process.env.NODE_ENV ?? "development",
  client_origin: process.env.CLIENT_ORIGIN ?? "*",
};

export default config;