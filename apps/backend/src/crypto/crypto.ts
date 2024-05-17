import crypto, { createHmac } from 'node:crypto';

// low-level methods (first tier)

export type KeyIvPair = Readonly<{
	key: Buffer;
	iv: Buffer;
}>;

export let encrypt = (
	algorithm: 'aes-128-xts' | 'aes-256-cbc',
	{ key, iv }: KeyIvPair,
	data: Buffer,
) => {
	let cipher = crypto.createCipheriv(algorithm, key, iv);

	return Buffer.concat([cipher.update(data), cipher.final()]);
};

export let decrypt = (
	algorithm: 'aes-128-xts' | 'aes-256-cbc',
	{ key, iv }: KeyIvPair,
	data: Buffer,
) => {
	let decipher = crypto.createDecipheriv(algorithm, key, iv);

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

export let encryptUserId = (
	metadata: Pick<
		DecryptedTokenMetadata,
		'backendKeyIvPair' | 'userKeyIvPair' | 'userId'
	>,
): Buffer => {
	return encrypt(
		'aes-256-cbc',
		metadata.userKeyIvPair,
		encrypt('aes-128-xts', metadata.backendKeyIvPair, metadata.userId),
	);
};

export let decryptUserId = (
	backendCipherParameters: KeyIvPair,
	userCipherParameters: KeyIvPair,
	encryptedBuffer: Buffer,
): Buffer => {
	return decrypt(
		'aes-128-xts',
		backendCipherParameters,
		decrypt('aes-256-cbc', userCipherParameters, encryptedBuffer),
	);
};

export let sign = (data: Buffer, signatureKey: Buffer) =>
	createHmac('sha256', signatureKey).update(data).digest();

export let verify = (
	buffer: Buffer,
	signatureKey: Buffer,
	signature: Buffer,
): boolean => {
	return sign(buffer, signatureKey).compare(signature) === 0;
};

// third tier
export let encryptTokenMetadata = (
	metadata: DecryptedTokenMetadata,
): EncryptedTokenMetadata => {
	let encryptedUserId = encryptUserId(metadata);

	let signature = sign(
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

export let verifyTokenMetadata = (
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
