function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }
  return secret;
}

export type AuthJwtPayload = {
  sub: string;
  email: string;
  role: "ADMIN" | "JUDGE" | "VIEWER";
  permissions: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
};

function base64UrlToUint8Array(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function verifyAccessToken(token: string): Promise<AuthJwtPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format.");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const headerBytes = base64UrlToUint8Array(encodedHeader);
  const headerText = new TextDecoder().decode(headerBytes);
  const header = JSON.parse(headerText);

  if (header.alg !== "HS256") {
    throw new Error("Unsupported JWT algorithm.");
  }

  const payloadBytes = base64UrlToUint8Array(encodedPayload);
  const payloadText = new TextDecoder().decode(payloadBytes);
  const payload = JSON.parse(payloadText) as AuthJwtPayload;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getJwtSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const signature = base64UrlToUint8Array(encodedSignature);
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const isValid = await crypto.subtle.verify("HMAC", key, signature, data);

  if (!isValid) {
    throw new Error("Invalid JWT signature.");
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) {
    throw new Error("JWT expired.");
  }

  return payload;
}
