import { apiClient } from "@/utils/apis/client";
import type { ApiError, PublishResponse } from "@codemod-com/utilities";
import type { AxiosError } from "axios";
import { Either } from "../utils/Either";

export const publishCodemod = async (options: {
  token: string;
  mainFileName: string;
  files: {
    mainFile: string;
    codemodRc: string;
  };
}): Promise<Either<ApiError | string, PublishResponse>> => {
  const {
    token,
    mainFileName,
    files: { codemodRc, mainFile },
  } = options;

  const formData = new FormData();

  formData.append(mainFileName, new Blob([mainFile], { type: "text/plain" }));
  formData.append(
    ".codemodrc.json",
    new Blob([codemodRc], { type: "text/plain" }),
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
