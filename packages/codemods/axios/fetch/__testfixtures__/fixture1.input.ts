const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
if (!response.ok) throw new Error('Network response was not ok');
const data = await response.arrayBuffer();
