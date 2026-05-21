import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = "15m";

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable.");
}

const JWT_SECRET_VALUE = JWT_SECRET;

export type AuthJwtPayload = {
  sub: string;
  email: string;
  role: "ADMIN" | "JUDGE" | "VIEWER";
  sessionId: string;
};

export function signAccessToken(payload: AuthJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET_VALUE, {
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AuthJwtPayload {
  return jwt.verify(token, JWT_SECRET_VALUE, {
    algorithms: ["HS256"],
  }) as AuthJwtPayload;
}
