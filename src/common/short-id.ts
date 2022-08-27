import * as crypto from "crypto";

export function generateShortId(): string {
  return crypto.randomBytes(4).toString("hex");
}
