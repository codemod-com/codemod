// @ts-nocheck
import { http, delay, HttpResponse } from "msw";

const handler = http.post("/url", async (_req, res, ctx) => {
  await delay(3000);
  return HttpResponse.json({});
});