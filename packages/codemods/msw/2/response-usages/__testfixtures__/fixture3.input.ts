// @ts-nocheck
import { http } from "msw";

const handler = http.post("/url", (_req, res, ctx) =>
  res(ctx.delay(3000), ctx.json({}))
);