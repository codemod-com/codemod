import { PricingPage } from "@/components/templates/PricingPage/Page";
import { loadPricingPage } from "@/data/sanity";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { RouteProps } from "@/types";
import type { ResolvingMetadata } from "next";
import dynamic from "next/dynamic";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

const PricingPagePreview = dynamic(
	() => import("@/components/templates/PricingPage/PagePreview"),
	{ ssr: false },
);

export async function generateMetadata(
	props: RouteProps,
	parent: ResolvingMetadata,
) {
	const initialData = await loadPricingPage("/pricing");

	if (!initialData?.data) return notFound();

	return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function Contact() {
	const initial = await loadPricingPage("/pricing");

	if (draftMode().isEnabled) {
		return (
			<PricingPagePreview initial={ initial } params={ { pathname: "/contact" } }/>
		);
	}

	return <PricingPage data={ initial.data }/>;
}
