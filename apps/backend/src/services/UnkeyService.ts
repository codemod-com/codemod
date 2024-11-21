import type { CreateAPIKeyRequest } from "@codemod-com/api-types";
import { Unkey } from "@unkey/api";
import { memoize } from "lodash-es";

const UNKEY_API_ID = process.env.UNKEY_API_ID as string;
const UNKEY_ROOT_KEY = process.env.UNKEY_ROOT_KEY as string;

const getUnkey = memoize(() => new Unkey({ rootKey: UNKEY_ROOT_KEY }));

export const createApiKey = async ({
  apiKeyData,
  externalId,
}: { apiKeyData: CreateAPIKeyRequest; externalId: string }) => {
  const response = await getUnkey().keys.create({
    apiId: UNKEY_API_ID,
    prefix: "codemod.com",
    externalId,
    name: apiKeyData.name,
    expires: apiKeyData.expiresAt
      ? Date.parse(apiKeyData.expiresAt)
      : undefined,
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.result;
};

export const listApiKeys = async ({ externalId }: { externalId: string }) => {
  const response = await getUnkey().apis.listKeys({
    apiId: UNKEY_API_ID,
    externalId,
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.result;
};

export const deleteApiKeys = async ({ keyIds }: { keyIds: string[] }) => {
  await Promise.all(
    keyIds.map(async (keyId) =>
      getUnkey().keys.delete({
        keyId,
      }),
    ),
  );
};
