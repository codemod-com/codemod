import { apiClient } from "@/utils/apis/client";

type GetCodeDiffResponse = {
  before: string;
  after: string;
};

export const getCodeDiff = async (body: {
  diffId: string;
  iv: string;
}): Promise<GetCodeDiffResponse | null> => {
  const { diffId, iv } = body;

  try {
    const response = await apiClient(`diffs/${diffId}?iv=${iv}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return (await response.json()) as GetCodeDiffResponse;
  } catch (e) {
    console.error(e);
    return null;
  }
};
