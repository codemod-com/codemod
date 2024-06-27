import crypto from "node:crypto";

// low-level methods (first tier)

export type KeyIvPair = Readonly<{
  key: Buffer;
  iv: Buffer;
}>;

export const encryptWithIv = (
  algorithm: "aes-128-xts" | "aes-256-cbc",
  { key, iv }: KeyIvPair,
  data: Buffer,
) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  return Buffer.concat([cipher.update(data), cipher.final()]);
};

export const decryptWithIv = (
  algorithm: "aes-128-xts" | "aes-256-cbc",
  { key, iv }: KeyIvPair,
  data: Buffer,
) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  return Buffer.concat([decipher.update(data), decipher.final()]);
};
