import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import config from "@/config";
import { client } from "@/data/sanity/client";

let clientWithToken = client.withConfig({ token: config.sanity.token });

export async function GET(request: Request) {
  let { isValid, redirectTo = "/" } = await validatePreviewUrl(
    clientWithToken,
    request.url,
  );
  if (!isValid) {
    return new Response("Invalid secret", { status: 401 });
  }

  draftMode().enable();

  redirect(redirectTo);
}
