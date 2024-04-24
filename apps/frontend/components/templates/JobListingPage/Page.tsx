import type { Job } from "@/types";
import JobListingPageContent from "./JobListingPageContent";

export interface JobListingPageProps {
	data: Job;
}

export default function JobListingPage({ data }: JobListingPageProps) {
	return <JobListingPageContent {...data} />;
}
