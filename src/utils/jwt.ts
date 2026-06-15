import jwt, {
  type SignOptions,
} from "jsonwebtoken";

import config from "../config";
import type { TJwtPayload } from "../modules/auth/auth.interface";

const generateToken = (
  payload: TJwtPayload,
): string => {
  const expiresIn =
    config.jwt_expires_in as NonNullable<
      SignOptions["expiresIn"]
    >;

  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign(
    payload,
    config.jwt_secret,
    options,
  );
};

export default generateToken;