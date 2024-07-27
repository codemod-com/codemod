import { apiClient } from "@/utils/apis/client";
import type { ApiError, PublishResponse } from "@codemod-com/api-types";
import type { TypeScriptProjectFiles } from "@codemod-com/utilities";
import type { AxiosError } from "axios";
import { Either } from "../utils/Either";
import { buildCodemodArchive } from "../utils/download";

export const publishCodemod = async (options: {
  files: TypeScriptProjectFiles;
  token: string;
}): Promise<Either<ApiError | string, PublishResponse>> => {
  const { token, files } = options;

  const formData = new FormData();
  const codemodZip = await buildCodemodArchive(files);

  formData.append(
    "codemod.tar.gz",
    new Blob([codemodZip], { type: "application/gzip" }),
  );

  try {
    const res = await apiClient.post<PublishResponse>("publish", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return Either.right(res.data);
  } catch (e) {
    const err = e as AxiosError<ApiError>;
    return Either.left(err.response?.data ?? err.message);
  }
};
