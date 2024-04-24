import type { CareersPagePayload } from "@/types";
import CareersPageContent from "./CareersPageContent";

export interface CareersPageProps {
	data: CareersPagePayload;
}

export default function CareersPage({ data }: CareersPageProps) {
	return <CareersPageContent data={data} />;
}
