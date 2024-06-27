const response = await fetch(url);
if (!response.ok) throw new Error("Network response was not ok.");
const data = await response.arrayBuffer();