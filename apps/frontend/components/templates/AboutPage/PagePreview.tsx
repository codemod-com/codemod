"use client";

import type { QueryResponseInitial } from "@sanity/react-loader";

import { useQuery } from "@/data/sanity/useQuery";

import PageCta from "@/components/templates/ModularPage/PageCta";
import { ABOUT_PAGE_QUERY } from "@/data/sanity/queries";
import type { AboutPagePayload } from "@/types";
import AboutPageSections from "./AboutPageContent";

type Props = {
	params: { pathname: string };
	initial: QueryResponseInitial<AboutPagePayload | null>;
};

export default function AboutPagePreview(props: Props) {
	const { params, initial } = props;
	const { data } = useQuery<AboutPagePayload | null>(ABOUT_PAGE_QUERY, params, {
		initial,
	});

	return (
		<div className="relative flex flex-col items-center justify-center">
			<AboutPageSections data={data!} />
			{data?.cta && <PageCta {...data.cta} />}
		</div>
	);
}
