import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Router } from "express";
import { authRouter } from "./routes/auth.js";
import { userRouter } from "./routes/user.js";

import { normalizeUnicode } from "./middlewares/normalizeUnicode.js";

const app = express();
const apiRouter = Router();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(normalizeUnicode);

app.use("/api", apiRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);

export default app;
