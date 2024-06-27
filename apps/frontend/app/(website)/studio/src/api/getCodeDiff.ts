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
    const res = await apiClient.get<GetCodeDiffResponse>(
      `diffs/${diffId}?iv=${iv}`,
    );

    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};
