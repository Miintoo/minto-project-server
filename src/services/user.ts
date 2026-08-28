import { randomBytes } from "node:crypto";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
};

const users: User[] = [];

export function findUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email === email);
}

export function createUser(input: {
  email: string;
  passwordHash: string;
}): User {
  const user = {
    id: randomBytes(12).toString("hex"),
    email: input.email,
    passwordHash: input.passwordHash,
  };

  users.push(user);
  return user;
}
