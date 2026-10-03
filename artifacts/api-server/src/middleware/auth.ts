import jwt from "jsonwebtoken";
import { AdminUser } from "../models/AdminUser.js";

const JWT_SECRET = process.env.SESSION_SECRET || "samacharhub-secret-key";
const JWT_REFRESH_SECRET = process.env.REFRESH_SECRET || "samacharhub-refresh-secret";

export interface AuthRequest {
  adminId?: string;
  headers?: any;
  [key: string]: any;
}

/**
 * Middleware: Verifies the Bearer JWT token from the Authorization header.
 * Attaches adminId to the request object on success.
 */
export function requireAuth(
  req: AuthRequest,
  res: any,
  next: any
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized — no token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.adminId = decoded.id;
    next();
  } catch (err: any) {
    if (err?.name === "TokenExpiredError") {
      res.status(401).json({ error: "Token expired — please log in again", code: "TOKEN_EXPIRED" });
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
  }
}

/**
 * Signs a short-lived access token (7 days).
 */
export function signToken(id: string): string {
  return jwt.sign({ id, type: "access" }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Signs a long-lived refresh token (30 days).
 * Store this securely on the client (httpOnly cookie or secure storage).
 */
export function signRefreshToken(id: string): string {
  return jwt.sign({ id, type: "refresh" }, JWT_REFRESH_SECRET, { expiresIn: "30d" });
}

/**
 * Verifies a refresh token and returns the admin id if valid.
 */
export function verifyRefreshToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string; type: string };
    if (decoded.type !== "refresh") return null;
    return decoded.id;
  } catch {
    return null;
  }
}

/**
 * Optional middleware: Extracts admin info if a token is present,
 * but does NOT block the request if missing. Useful for semi-public routes.
 */
export async function optionalAuth(
  req: AuthRequest,
  _res: any,
  next: any
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      req.adminId = decoded.id;
    } catch {
      // Silently ignore invalid tokens for optional auth
    }
  }
  next();
}
