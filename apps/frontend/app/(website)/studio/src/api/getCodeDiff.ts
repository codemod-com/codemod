import apiClient from "./client";

type GetCodeDiffResponse = {
  before: string;
  after: string;
};

export let getCodeDiff = async (body: {
  diffId: string;
  iv: string;
}): Promise<GetCodeDiffResponse | null> => {
  let { diffId, iv } = body;

  try {
    let res = await apiClient.get<GetCodeDiffResponse>(
      `diffs/${diffId}?iv=${iv}`,
    );

    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};
