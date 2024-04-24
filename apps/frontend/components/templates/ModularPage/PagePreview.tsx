"use client";

import type { QueryResponseInitial } from "@sanity/react-loader";

import { useQuery } from "@/data/sanity/useQuery";
import { type ModularPagePayload, PagePayload } from "@/types";

import PageCta from "@/components/templates/ModularPage/PageCta";
import PageHero from "@/components/templates/ModularPage/PageHero";
import { PAGE_QUERY } from "@/data/sanity/queries";
import { SectionsRenderer } from "../../SectionsRenderer";
import { sections } from "../../sections/sections.preview";

type PreviewRouteProps = {
	initial: QueryResponseInitial<ModularPagePayload | null>;
};

export default function PagePreview(props: PreviewRouteProps) {
	const { initial } = props;

	const { data } = useQuery<ModularPagePayload | null>(
		PAGE_QUERY,
		{
			pathname: initial.data?.pathname,
			locale: "en",
		},
		{
			initial,
		},
	);

	return (
		<div className="relative flex flex-col items-center justify-center">
			{data?.hero && <PageHero {...data.hero} />}
			<SectionsRenderer
				sections={data?.sections ?? []}
				fieldName="sections"
				componentsMap={sections}
			/>
			{data?.cta && <PageCta {...data.cta} />}
		</div>
	);
}
