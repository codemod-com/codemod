export const getHeadersWithAuth = (token: string | null) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});
