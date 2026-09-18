import { randomBytes } from "node:crypto";
import { pool } from "../db.js";

export type User = {
  id: string;
  name: string;
  nickname: string;
  username: string;
  passwordHash: string;
};

const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    nickname: "john",
    username: "john",
    passwordHash: "123456",
  },
];

function toUser(row: {
  id: string;
  name: string;
  nickname: string;
  username: string;
  password_hash: string;
}): User {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    username: row.username,
    passwordHash: row.password_hash,
  };
}

export async function findUserByNickname(
  nickname: string,
): Promise<User | undefined> {
  const { rows } = await pool.query(
    `SELECT id, name, nickname, username, password_hash FROM users WHERE nickname = $1`,
    [nickname],
  );

  return rows[0] ? toUser(rows[0]) : undefined;
}

export async function findUserByUsername(
  username: string,
): Promise<User | undefined> {
  const { rows } = await pool.query(
    `SELECT id, name, nickname, username, password_hash FROM users WHERE username = $1`,
    [username],
  );

  return rows[0] ? toUser(rows[0]) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const { rows } = await pool.query(
    `SELECT id, name, nickname, username FROM users WHERE id = $1`,
    [id],
  );

  return rows[0] ? rows[0] : undefined;
}

export async function createUser(input: {
  name: string;
  nickname: string;
  username: string;
  passwordHash: string;
}): Promise<User> {
  const id = randomBytes(12).toString("hex");

  const { rows } = await pool.query(
    `INSERT INTO users (id, name, nickname, username, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, nickname, username, password_hash`,
    [id, input.name, input.nickname, input.username, input.passwordHash],
  );

  return toUser(rows[0]);
}
