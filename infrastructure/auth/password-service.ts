import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, key] = hashedPassword.split(":");
  if (!salt || !key) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");
  return keyBuffer.length === derivedKey.length && timingSafeEqual(keyBuffer, derivedKey);
}
