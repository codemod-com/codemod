import config from "@/config";
import { type BasicPageDocumentPayload, PublishStatus } from "@/types";
import { pathToAbsUrl } from "@/utils/urls";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";
import type { Metadata, ResolvingMetadata } from "next";
import { imageBuilder } from "./client";

export function getOgImages(image: SanityImageObject) {
  const builder = imageBuilder.image(image).fit("max").auto("format");

  return [
    {
      url: builder.width(1200).url(),
      width: 1200,
    },
  ];
}

export async function resolveSanityRouteMetadata(
  data: BasicPageDocumentPayload,
  parentPromise: ResolvingMetadata,
): Promise<Metadata | null> {
  if (!data) return null;

  const seo = data?.seo;

  if (!seo) {
    return { title: config.siteName };
  }

  const parent = await parentPromise;
  const title = seo?.title || config.siteName;
  const canonicalUrl = seo?.canonicalUrl || pathToAbsUrl(data.pathname);
  const ogImages = !seo?.image
    ? parent.openGraph?.images
    : getOgImages(seo.image);

  return {
    title,
    openGraph: {
      title,
      url: canonicalUrl,
      images: ogImages,
    },
    robots:
      data?.publishStatus !== PublishStatus.public
        ? "noindex nofollow"
        : undefined,
    description: seo?.description || "",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
