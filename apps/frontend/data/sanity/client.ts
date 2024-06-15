import publicConfig from "@/config";
import { type ClientPerspective, createClient } from "@sanity/client/stega";
import createImageUrlBuilder from "@sanity/image-url";

let clientConfig = {
  projectId: publicConfig.sanity.projectId,
  dataset: publicConfig.sanity.dataset,
  apiVersion: publicConfig.sanity.apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published" as ClientPerspective,
};

export let client = createClient({
  ...clientConfig,
  stega: {
    studioUrl: publicConfig.sanity.studioUrl,
    // logger: console,
  },
});

export let imageBuilder = createImageUrlBuilder({
  projectId: clientConfig.projectId || "",
  dataset: clientConfig.dataset || "",
});
