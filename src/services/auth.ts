import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { findUserByEmail, createUser } from "./user.js";

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

export async function register(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    throw new AuthError("이메일과 비밀번호를 입력하세요", 400);
  }

  if (password.length < 8) {
    throw new AuthError("비밀번호는 8자 이상이어야 합니다", 400);
  }

  if (findUserByEmail(email)) {
    throw new AuthError("이미 가입된 이메일입니다", 409);
  }

  const user = createUser({
    email,
    passwordHash: await hashPassword(password),
  });

  return { id: user.id, email: user.email };
}
