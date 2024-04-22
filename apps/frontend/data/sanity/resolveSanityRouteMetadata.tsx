import type { Metadata, ResolvingMetadata } from "next";

import {
	getAutomationFramworkTitle,
	getFilterIcon,
	getFilterSection,
} from "@/components/templates/Registry/helpers";
import config from "@/config";
import { REGISTRY_FILTER_TYPES } from "@/constants";
import {
	type BasicPageDocumentPayload,
	type BlogArticlePayload,
	type CodemodPagePayload,
	type Job,
	PublishStatus,
} from "@/types";
import { capitalize } from "@/utils/strings";
import { pathToAbsUrl } from "@/utils/urls";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";
import { imageBuilder } from "./client";

export function getOgImages(
	image: SanityImageObject,
	options?: { width: number },
) {
	const builder = imageBuilder.image(image).fit("max").auto("format");

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
	const queryString = new URLSearchParams({
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

	const seo = data?.seo;

	if (!seo) {
		return { title: config.siteName };
	}

	const parent = await parentPromise;

	const title =
		seo?.title ||
		capitalize((data as CodemodPagePayload)?.automationName) ||
		data.title ||
		config.siteName;

	const canonicalUrl = seo?.canonicalUrl || pathToAbsUrl(data.pathname);

	const { filterIconDictionary, applicability, author } =
		data as CodemodPagePayload;
	const { department, location } = data as Job;

	const automationFrom = getAutomationFramworkTitle(data as CodemodPagePayload);
	const fSectionFrom = getFilterSection(
		REGISTRY_FILTER_TYPES.framework,
		filterIconDictionary,
	);
	const fIconFrom = getFilterIcon(
		fSectionFrom,
		automationFrom.replace(/\/.+/g, ""),
	);
	const fIconFromURl = fIconFrom?.image?.light
		? getOgImages(fIconFrom.image.light, { width: 48 })?.[0]?.url
		: "";

	const automationTo = applicability?.to?.[0]?.[0] || "";
	const fSectionTo = getFilterSection(
		REGISTRY_FILTER_TYPES.framework,
		filterIconDictionary,
	);
	const fIconTo = getFilterIcon(fSectionTo, automationTo);
	const fIconToURl = fIconTo?.image?.light
		? getOgImages(fIconTo.image.light, { width: 48 })?.[0]?.url
		: "";

	const automationAuthor = author;
	const automationAuthorValues = getFilterSection(
		REGISTRY_FILTER_TYPES.owner,
		filterIconDictionary,
	);
	const automationAuthorImg = getFilterIcon(
		automationAuthorValues,
		automationAuthor,
	)?.image?.light;
	const automationAuthorImgUrl = automationAuthorImg
		? getOgImages(automationAuthorImg)[0].url
		: "";
	const blogAuthors = (data as BlogArticlePayload)?.authors?.map((a) => ({
		name: a.name,
		image: getOgImages(a.image)?.[0].url,
	}));

	// Skip generation if image if SEO image is present
	const ogQueryString = seo?.image
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
	const ogImages = seo?.image
		? getOgImages(seo.image)
		: // Then default to generated image
			ogQueryString
			? {
					url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?${ogQueryString}`,
					width: 1200,
				}
			: parent.openGraph?.images;

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
