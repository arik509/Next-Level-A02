export type TUserRole =
  | "contributor"
  | "maintainer";

export interface TSignupPayload {
  name: string;
  email: string;
  password: string;
  role: TUserRole;
}

export interface TPublicUser {
  id: number;
  name: string;
  email: string;
  role: TUserRole;
  created_at: Date;
  updated_at: Date;
}

export interface TDatabaseUser extends TPublicUser {
  password: string;
}