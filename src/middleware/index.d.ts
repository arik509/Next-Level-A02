import type { TJwtPayload } from "../modules/auth/auth.interface";

declare global {
  namespace Express {
    interface Request {
      user?: TJwtPayload;
    }
  }
}

export {};