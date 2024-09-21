export async function fetchStream(opts: {
  url: string;
  token: string;
  onChunk: (chunk: string) => Promise<unknown>;
  options?: Parameters<typeof fetch>[1];
}) {
  const { url, onChunk, options } = opts;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${opts.token}`,
    },
  });

  if (response.body === null) {
    throw new Error("ReadableStream not yet supported in this browser.");
  }

  for await (const chunk of response.body as any) {
    if (options?.signal?.aborted) break;

    onChunk(chunk.toString());
  }
}
