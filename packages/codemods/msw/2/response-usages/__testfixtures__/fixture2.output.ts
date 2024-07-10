// @ts-nocheck
import { http, HttpResponse } from "msw";

http.get("/resource", (req, res, ctx) => {
return HttpResponse.json(null, {
    headers: {
      "Set-Cookie": "token=abc-123;"
    }
  })
});