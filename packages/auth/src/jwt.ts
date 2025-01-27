import jwt, { type GetPublicKeyOrSecret, type JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: process.env.JWKS_URI ?? "http://codemod-zitadel:52000/oauth/v2/keys",
});

interface SigningKey {
  getPublicKey(): string;
}

const getKey: GetPublicKeyOrSecret = (header, callback) => {
  client.getSigningKey(header.kid, (err: Error | null, key?: SigningKey) => {
    if (!!err || !key) {
      callback(err, undefined);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
};

export const jwtVerificationResult = async (jwtToken: string) =>
  await new Promise<string | JwtPayload | undefined>((resolve, reject) => {
    jwt.verify(jwtToken, getKey, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });

export const decodeJwt = (token: string) => {
  return jwt.decode(token, { complete: true });
};
