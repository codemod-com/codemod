import JobListingPage from "@/components/templates/JobListingPage/Page";
import JobListingPagePreview from "@/components/templates/JobListingPage/PagePreview";
import { loadJobListingPage } from "@/data/sanity";
import { client } from "@/data/sanity/client";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { RouteProps } from "@/types";
import type { ResolvingMetadata } from "next";
import { groq } from "next-sanity";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

export async function generateMetadata(
	props: RouteProps,
	parent: ResolvingMetadata,
) {
	const initialData = await loadJobListingPage(`/careers/${props.params.path}`);

	if (!initialData?.data) return notFound();

	return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function Job(props: RouteProps) {
	const initial = await loadJobListingPage(`/careers/${props.params.path}`);

	if (!initial?.data) return notFound();

	if (draftMode().isEnabled) {
		return (
			<JobListingPagePreview
				initial={initial}
				params={{ pathname: `/careers/${props.params.path}` }}
			/>
		);
	}

	return <JobListingPage data={initial.data} />;
}

export async function generateStaticParams() {
	const jobs = await client.fetch(groq`*[_type == 'job']`);
	const paths = jobs.map((job: any) => ({
		path: job.pathname.current.replace("/careers/", ""),
	}));

	return paths;
}
