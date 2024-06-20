import config from "@/config";
import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

let { dataset, projectId } = config.sanity;

export let imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
});

export let urlForImage = (source: Image | undefined) => {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined;
  }

  return imageBuilder?.image(source).auto("format").fit("max");
};

export function urlForOpenGraphImage(image: Image | undefined) {
  return urlForImage(image)?.width(1200).height(627).fit("crop").url();
}

// Note: this assumes that every document that has a slug field
// have it on the `slug` field at the root
export async function isUnique(slug, context) {
  let { document, getClient } = context;
  let client = getClient({ apiVersion: "2023-06-21" });
  let id = document._id.replace(/^drafts\./, "");
  let params = {
    draft: `drafts.${id}`,
    published: id,
    slug,
  };
  let query = `*[!(_id in [$draft, $published]) && pathname.current == $slug]`;
  let result = await client.fetch(query, params);

  return result.length === 0;
}
