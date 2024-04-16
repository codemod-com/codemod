"use client";

import type { QueryResponseInitial } from "@sanity/react-loader";

import { useQuery } from "@/data/sanity/useQuery";

import { CAREERS_PAGE_QUERY } from "@/data/sanity/queries";
import type { CareersPagePayload } from "@/types";
import CareersPageContent from "./CareersPageContent";

type Props = {
	params: { pathname: string };
	initial: QueryResponseInitial<CareersPagePayload | null>;
};

export default function CareersPagePreview(props: Props) {
	const { params, initial } = props;
	const { data } = useQuery<CareersPagePayload | null>(
		CAREERS_PAGE_QUERY,
		params,
		{
			initial,
		},
	);

	return (
		<div className="relative flex flex-col items-center justify-center">
			<CareersPageContent data={data!} />
		</div>
	);
}
