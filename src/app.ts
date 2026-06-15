import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import config from "./config";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import { authRoute } from "./modules/auth/auth.route";

const app: Application = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: config.client_origin,
  }),
);

app.use(express.json());
app.use(express.text());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get(
  "/",
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "DevPulse API is running",
    });
  },
);

app.use("/api/auth", authRoute);

app.use(notFound);
app.use(globalErrorHandler);

export default app;