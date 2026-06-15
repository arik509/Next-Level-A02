import { Router } from "express";

import auth from "../../middleware/auth";
import { issueController } from "./issue.controller";

const router = Router();

router.get(
  "/",
  issueController.getAllIssues,
);

router.post(
  "/",
  auth("contributor", "maintainer"),
  issueController.createIssue,
);

export const issueRoute = router;