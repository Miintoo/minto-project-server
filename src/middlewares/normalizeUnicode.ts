// src/middlewares/normalizeUnicode.ts
import type { Request, Response, NextFunction } from "express";

const NON_ASCII = /[^\x00-\x7F]/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeDeep(value: unknown): unknown {
  if (typeof value === "string") {
    return NON_ASCII.test(value) ? value.normalize("NFC") : value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeDeep);
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (key === "__proto__") continue;
      result[NON_ASCII.test(key) ? key.normalize("NFC") : key] =
        normalizeDeep(item);
    }
    return result;
  }

  return value;
}

export function normalizeUnicode(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.body !== undefined) {
    req.body = normalizeDeep(req.body);
  }

  // req.query는 setter 없는 getter라 대입이 아니라 재정의로 덮어써야 한다
  Object.defineProperty(req, "query", {
    value: normalizeDeep(req.query),
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
}
