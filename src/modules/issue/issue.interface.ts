import type { TUserRole } from "../auth/auth.interface";

export type TIssueType =
  | "bug"
  | "feature_request";

export type TIssueStatus =
  | "open"
  | "in_progress"
  | "resolved";

export type TIssueSort =
  | "newest"
  | "oldest";

export interface TCreateIssuePayload {
  title: string;
  description: string;
  type: TIssueType;
}

export interface TIssue {
  id: number;
  title: string;
  description: string;
  type: TIssueType;
  status: TIssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface TIssueQuery {
  sort: TIssueSort;
  type?: TIssueType;
  status?: TIssueStatus;
}

export interface TIssueReporter {
  id: number;
  name: string;
  role: TUserRole;
}

export interface TIssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: TIssueType;
  status: TIssueStatus;
  reporter: TIssueReporter;
  created_at: Date;
  updated_at: Date;
}

export interface TUpdateIssuePayload {
  title?: string;
  description?: string;
  type?: TIssueType;
  status?: TIssueStatus;
}