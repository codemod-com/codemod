"use client";

import type { QueryResponseInitial } from "@sanity/react-loader/rsc";

import { TEXT_PAGE_QUERY } from "@/data/sanity/queries";
import { useQuery } from "@/data/sanity/useQuery";
import type { TextPagePayload } from "@/types";
import TextPage from "./TextPage";

type PreviewRouteProps = {
	initial: QueryResponseInitial<TextPagePayload | null>;
};
export default function TextPagePreview(props: PreviewRouteProps) {
	const { initial } = props;
	const { data } = useQuery<TextPagePayload | null>(
		TEXT_PAGE_QUERY,
		{
			pathname: initial.data?.pathname,
			locale: "en",
		},
		{ initial },
	);

	return data?._id && <TextPage data={data} />;
}
