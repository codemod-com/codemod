import config from "@/config";
import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

const { dataset, projectId } = config.sanity;

export const imageBuilder = createImageUrlBuilder({
	projectId: projectId || "",
	dataset: dataset || "",
});

export const urlForImage = (source: Image | undefined) => {
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
	const { document, getClient } = context;
	const client = getClient({ apiVersion: "2023-06-21" });
	const id = document._id.replace(/^drafts\./, "");
	const params = {
		draft: `drafts.${id}`,
		published: id,
		slug,
	};
	const query = `*[!(_id in [$draft, $published]) && pathname.current == $slug]`;
	const result = await client.fetch(query, params);

	return result.length === 0;
}
