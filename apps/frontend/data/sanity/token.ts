import "server-only";

export let token = process.env.SANITY_API_TOKEN;

if (!token) {
  throw new Error("Missing SANITY_API_TOKEN");
}
