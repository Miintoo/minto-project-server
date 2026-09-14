import { Router } from "express";
import { findUserByNickname, findUserByUsername } from "../services/user.js";

export const userRouter = Router();

userRouter.get("/verify-nickname", async (req, res) => {
  const raw = req.query.nickname;
  const nickname = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!nickname) {
    res.status(400).json({ message: "Nickname is required" });
    return;
  }

  const exists = Boolean(await findUserByNickname(nickname));

  if (exists) {
    res.status(400).json({ message: "이미 사용중인 닉네임입니다." });
    return;
  }

  res.json({
    nickname,
    isAvailable: !exists,
  });
});

userRouter.get("/verify-username", async (req, res) => {
  const raw = req.query.username;
  const username = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!username) {
    res.status(400).json({ message: "Username is required" });
    return;
  }

  const exists = Boolean(await findUserByUsername(username));

  if (exists) {
    res.status(400).json({ message: "이미 사용중인 아이디입니다." });
    return;
  }

  res.json({
    username,
    isAvailable: !exists,
  });
});
