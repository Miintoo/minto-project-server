import { Router } from "express";
import { AuthError, register } from "../services/auth.js";
import { login, logout } from "../services/auth.js";
import { getSession } from "../services/session.js";
import { findUserById } from "../services/user.js";

export const authRouter = Router();

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  };
}

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

authRouter.post("/login", async (req, res) => {
  try {
    const result = await login(
      req.body as {
        username: string;
        password: string;
      },
    );

    res.cookie("session_id", result.sessionId, sessionCookieOptions());
    res.json(result.user);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "서버 오류로 로그인에 실패했습니다." });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const sessionId = req.cookies?.["session_id"];
    await logout(sessionId);

    res.clearCookie("session_id", sessionCookieOptions());
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "서버 오류로 로그아웃에 실패했습니다." });
  }
});

authRouter.get("/me", async (req, res) => {
  try {
    const sessionId = req.cookies?.["session_id"];
    const session = await getSession(sessionId);

    if (!session) {
      res.status(401).json({ message: "로그인이 필요합니다." });
      return;
    }

    const user = await findUserById(session.userId);
    if (!user) {
      res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "서버 오류로 사용자 정보 조회에 실패했습니다." });
  }
});
