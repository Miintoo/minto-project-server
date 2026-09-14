import { Router } from "express";
import { AuthError, register } from "../services/auth.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const user = await register(
      req.body as {
        name: string;
        nickname: string;
        username: string;
        password: string;
      },
    );

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "서버 오류로 회원가입에 실패했습니다." });
  }
});
