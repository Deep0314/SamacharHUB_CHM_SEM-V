import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "vidarbha-secret-key";

export interface AuthRequest {
  adminId?: string;
  headers?: any;
  [key: string]: any;
}

export function requireAuth(
  req: AuthRequest,
  res: any,
  next: any
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.sSHit(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.adminId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function signToken(id: string): string {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
}
