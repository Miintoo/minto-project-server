import { randomBytes } from "node:crypto";
import { pool } from "../db.js";

export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
};

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId: string): Promise<Session> {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const { rows } = await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, expires_at`,
    [id, userId, expiresAt],
  );

  return {
    id: rows[0].id,
    userId: rows[0].user_id,
    expiresAt: rows[0].expires_at,
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}

export async function getSession(
  sessionId: string,
): Promise<Session | undefined> {
  const { rows } = await pool.query(
    `SELECT id, user_id, expires_at FROM sessions WHERE id = $1`,
    [sessionId],
  );

  return rows[0]
    ? {
        id: rows[0].id,
        userId: rows[0].user_id,
        expiresAt: rows[0].expires_at,
      }
    : undefined;
}
