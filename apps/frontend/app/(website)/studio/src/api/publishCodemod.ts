import { apiClient } from "@/utils/apis/client";
import type { AxiosError } from "axios";

type PublishResponse = { success: true } | { success: false; error: string };

export const publishCodemod = async (options: {
  token: string;
  mainFileName: string;
  files: {
    mainFile: string;
    codemodRc: string;
  };
}): Promise<PublishResponse | null> => {
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

    return res.data;
  } catch (err) {
    const axiosError = err as AxiosError<PublishResponse & { success: false }>;
    console.error(axiosError.response?.data.error);

    return null;
  }
};
