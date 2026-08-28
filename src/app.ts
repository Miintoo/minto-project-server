import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Router } from "express";
import { authRouter } from "./routes/auth.js";

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

app.use("/api", apiRouter);
apiRouter.use("/auth", authRouter);

export default app;
