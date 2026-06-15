import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import config from "./config";

const app: Application = express();

app.use(
  cors({
    origin: config.client_origin,
  }),
);

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "DevPulse API is running",
  });
});

export default app;