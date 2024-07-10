// @ts-nocheck
import { http } from "msw";

http.get("/resource", (req, res, ctx) => {
  return res(ctx.cookie("token", "abc-123"))
});