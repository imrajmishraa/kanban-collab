import bcrypt from "bcrypt";
import { ENV } from "../../config/env";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(ENV.BCRYPT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
