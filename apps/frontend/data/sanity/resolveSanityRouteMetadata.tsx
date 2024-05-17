import type { Metadata, ResolvingMetadata } from "next";

import {
  getAutomationFrameworkTitles,
  getFilterIcon,
  getFilterSection,
} from "@/components/templates/Registry/helpers";
import publicConfig from "@/config";
import { REGISTRY_FILTER_TYPES } from "@/constants";
import { env } from "@/env";
import {
  type BasicPageDocumentPayload,
  type BlogArticlePayload,
  type CodemodPagePayload,
  type Job,
  PublishStatus,
} from "@/types";
import { capitalize, insertMergeTags } from "@/utils/strings";
import { pathToAbsUrl } from "@/utils/urls";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";
import { imageBuilder } from "./client";

export function getOgImages(
  image: SanityImageObject,
  options?: { width: number },
) {
  let builder = imageBuilder.image(image).fit("max").auto("format");

  return [
    {
      url: builder.width(options?.width || 1200).url(),
      width: options?.width || 1200,
    },
  ];
}

type OGImageParams = {
  type: string;
  title: string;

  jobLocation?: string;
  jobDepartment?: string;

  blogAuthors?: { name?: string; image?: string }[];

  automationAuthor?: { name?: string; image?: string };
  automationFrom?: { framework: string; image: string };
  automationTo?: { framework: string; image: string };
};

async function generateOGQueryString({
  type,
  title,
  jobLocation,
  jobDepartment,
  blogAuthors,
  automationAuthor,
  automationFrom,
  automationTo,
}: OGImageParams) {
  let queryString = new URLSearchParams({
    type,
    title,
    jobLocation: jobLocation || "",
    jobDepartment: jobDepartment || "",
    blogAuthors:
      blogAuthors
        ?.slice(0, 3)
        .map((a) => `${a.name};${a.image}`)
        .join("::") || "",
    automationAuthor: automationAuthor?.name
      ? `${automationAuthor?.name};${automationAuthor?.image}`
      : "",
    automationFrom:
      `${automationFrom?.framework};${automationFrom?.image}` || "",
    automationTo: automationTo?.framework
      ? `${automationTo?.framework};${automationTo?.image}`
      : "",
  }).toString();

  return queryString;
}

export async function resolveSanityRouteMetadata(
  data: BasicPageDocumentPayload,
  parentPromise: ResolvingMetadata,
): Promise<Metadata | null> {
  if (!data) return null;

  let seo = data?.seo;

  if (!seo) {
    return { title: publicConfig.siteName };
  }

  let parent = await parentPromise;

  let title =
    seo?.title ||
    capitalize((data as CodemodPagePayload)?.automationName) ||
    data.title ||
    publicConfig.siteName;

  let canonicalUrl = seo?.canonicalUrl || pathToAbsUrl(data.pathname);

  let { filterIconDictionary, applicability, author } =
    data as CodemodPagePayload;
  let { department, location } = data as Job;

  // @TODO
  let automationFrom =
    getAutomationFrameworkTitles(data as CodemodPagePayload)[0] ?? "";

  let fSectionFrom = getFilterSection(
    REGISTRY_FILTER_TYPES.framework,
    filterIconDictionary,
  );
  let fIconFrom = getFilterIcon(
    fSectionFrom,
    automationFrom.replace(/\/.+/g, ""),
  );
  let fIconFromURl = fIconFrom?.image?.light
    ? getOgImages(fIconFrom.image.light, { width: 48 })?.[0]?.url
    : "";

  let automationTo = applicability?.to?.[0]?.[0] || "";
  let fSectionTo = getFilterSection(
    REGISTRY_FILTER_TYPES.framework,
    filterIconDictionary,
  );
  let fIconTo = getFilterIcon(fSectionTo, automationTo);
  let fIconToURl = fIconTo?.image?.light
    ? getOgImages(fIconTo.image.light, { width: 48 })?.[0]?.url
    : "";

  let automationAuthor = author;
  let automationAuthorValues = getFilterSection(
    REGISTRY_FILTER_TYPES.owner,
    filterIconDictionary,
  );
  let automationAuthorImg = getFilterIcon(
    automationAuthorValues,
    automationAuthor,
  )?.image?.light;
  let automationAuthorImgUrl = automationAuthorImg
    ? getOgImages(automationAuthorImg)[0].url
    : "";
  let blogAuthors = (data as BlogArticlePayload)?.authors?.map((a) => ({
    name: a.name,
    image: getOgImages(a.image)?.[0].url,
  }));

  // Skip generation if image if SEO image is present
  let ogQueryString = seo?.image
    ? ""
    : await generateOGQueryString({
        type: data._type,
        title,
        jobLocation: location,
        jobDepartment: department,
        blogAuthors,

        automationAuthor: {
          name: (data as CodemodPagePayload)?.author,
          image: automationAuthorImgUrl,
        },
        automationFrom: { framework: automationFrom, image: fIconFromURl },
        automationTo: { framework: automationTo, image: fIconToURl },
      });

  // Always use the image from the CMS if present
  let ogImages = seo?.image
    ? getOgImages(seo.image)
    : // Then default to generated image
      ogQueryString
      ? {
          url: `${env.NEXT_PUBLIC_BASE_URL}/api/og?${ogQueryString}`,
          width: 1200,
        }
      : parent.openGraph?.images;

  let _automationDescription =
    (data as CodemodPagePayload)?.globalLabels?.ogDescription || "";

  let automationDescription = insertMergeTags(_automationDescription, {
    framework: capitalize(automationFrom),
    codemod_name: title,
  });

  let description = seo?.description || automationDescription || "";
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
