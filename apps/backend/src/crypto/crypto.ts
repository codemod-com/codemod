import crypto, { createHmac } from "node:crypto";

// low-level methods (first tier)

export type KeyIvPair = Readonly<{
  key: Buffer;
  iv: Buffer;
}>;

export const encrypt = (
  algorithm: "aes-128-xts" | "aes-256-cbc",
  { key, iv }: KeyIvPair,
  data: Buffer,
) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  return Buffer.concat([cipher.update(data), cipher.final()]);
};

export const decrypt = (
  algorithm: "aes-128-xts" | "aes-256-cbc",
  { key, iv }: KeyIvPair,
  data: Buffer,
) => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  return Buffer.concat([decipher.update(data), decipher.final()]);
};

// low-level methods (second tier)
export type DecryptedTokenMetadata = Readonly<{
  backendKeyIvPair: KeyIvPair;
  userKeyIvPair: KeyIvPair;
  userId: Buffer;
  createdAt: Buffer;
  expiresAt: Buffer;
  claims: Buffer;
  signaturePrivateKey: Buffer;
}>;

export type EncryptedTokenMetadata = Readonly<{
  backendInitializationVector: Buffer; // biv
  encryptedUserId: Buffer; // euid
  createdAt: Buffer;
  expiresAt: Buffer; // ea
  claims: Buffer; // c
  signature: Buffer; // s
}>;

export const encryptUserId = (
  metadata: Pick<
    DecryptedTokenMetadata,
    "backendKeyIvPair" | "userKeyIvPair" | "userId"
  >,
): Buffer => {
  return encrypt(
    "aes-256-cbc",
    metadata.userKeyIvPair,
    encrypt("aes-128-xts", metadata.backendKeyIvPair, metadata.userId),
  );
};

export const decryptUserId = (
  backendCipherParameters: KeyIvPair,
  userCipherParameters: KeyIvPair,
  encryptedBuffer: Buffer,
): Buffer => {
  return decrypt(
    "aes-128-xts",
    backendCipherParameters,
    decrypt("aes-256-cbc", userCipherParameters, encryptedBuffer),
  );
};

export const sign = (data: Buffer, signatureKey: Buffer) =>
  createHmac("sha256", signatureKey).update(data).digest();

export const verify = (
  buffer: Buffer,
  signatureKey: Buffer,
  signature: Buffer,
): boolean => {
  return sign(buffer, signatureKey).compare(signature) === 0;
};

// third tier
export const encryptTokenMetadata = (
  metadata: DecryptedTokenMetadata,
): EncryptedTokenMetadata => {
  const encryptedUserId = encryptUserId(metadata);

  const signature = sign(
    Buffer.concat([
      metadata.userKeyIvPair.iv,
      encryptedUserId,
      metadata.createdAt,
      metadata.expiresAt,
      metadata.claims,
      metadata.backendKeyIvPair.iv,
    ]),
    metadata.signaturePrivateKey,
  );

  return {
    encryptedUserId,
    expiresAt: metadata.expiresAt,
    claims: metadata.claims,
    createdAt: metadata.createdAt,
    backendInitializationVector: metadata.backendKeyIvPair.iv,
    signature,
  };
};

export const verifyTokenMetadata = (
  userKeyIvPair: KeyIvPair,
  metadata: EncryptedTokenMetadata,
  signaturePrivateKey: Buffer,
): boolean =>
  verify(
    Buffer.concat([
      userKeyIvPair.iv,
      metadata.encryptedUserId,
      metadata.createdAt,
      metadata.expiresAt,
      metadata.claims,
      metadata.backendInitializationVector,
    ]),
    signaturePrivateKey,
    metadata.signature,
  );
