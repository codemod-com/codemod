import RegistryIndex from "@/components/templates/Registry/RegistryIndex";
import RegistryIndexPreview from "@/components/templates/Registry/RegistryIndexPreview";
import { loadRegistryAPIData } from "@/data/codemod/loaders";
import { loadRegistryIndex } from "@/data/sanity/loadQuery";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { Metadata, ResolvingMetadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(
	_: unknown,
	parent: ResolvingMetadata,
): Promise<Metadata | null> {
	const initialData = await loadRegistryIndex();
	if (!initialData?.data) return notFound();

	return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function RegistryIndexRoute({
	params,
	searchParams,
}: {
	params: { locale: string; tag?: string };
	searchParams: URLSearchParams;
}) {
	const [initialSanityData, automationPayload] = await Promise.all([
		loadRegistryIndex(),
		loadRegistryAPIData({
			pageNumber: 1,
			searchParams,
			entriesPerPage: 20,
		}),
	]);

	if (!initialSanityData?.data) {
		notFound();
	}

	initialSanityData.data.entries = automationPayload?.data;
	initialSanityData.data.entriesCount = Number(automationPayload?.data?.length);
	initialSanityData.data.automationFilters = automationPayload?.filters;
	initialSanityData.data.total = Number(automationPayload?.total);
	initialSanityData.data.entriesPerPage = Number(automationPayload?.size);

	return draftMode().isEnabled ? (
		<RegistryIndexPreview initial={initialSanityData} />
	) : (
		<RegistryIndex data={initialSanityData.data} />
	);
}
