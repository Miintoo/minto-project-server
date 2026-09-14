import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { findUserByUsername, createUser, findUserByNickname } from "./user.js";

const scryptAsync = promisify(scrypt);

export class AuthError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;

  return `${salt}:${derived.toString("hex")}`;
}

export async function register(input: {
  name: string;
  nickname: string;
  username: string;
  password: string;
}) {
  const name = input.name.trim();
  const nickname = input.nickname.trim();
  const username = input.username.trim().toLowerCase();
  const password = input.password;

  if (!name || !nickname || !username || !password) {
    throw new AuthError("이메일과 비밀번호를 입력하세요", 400);
  }

  if (password.length < 8) {
    throw new AuthError("비밀번호는 8자 이상이어야 합니다", 400);
  }

  if (await findUserByUsername(username)) {
    throw new AuthError("이미 가입된 이메일입니다", 409);
  }

  if (await findUserByNickname(nickname)) {
    throw new AuthError("이미 가입된 닉네임입니다", 409);
  }

  const user = await createUser({
    name: name,
    nickname: nickname,
    username: username,
    passwordHash: await hashPassword(password),
  });

  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    username: user.username,
  };
}
