import PageCta from "@/components/templates/ModularPage/PageCta";
import type { AboutPagePayload } from "@/types";
import AboutPageContent from "./AboutPageContent";

export interface AboutPageProps {
	data: AboutPagePayload;
}

export function AboutPage({ data }: AboutPageProps) {
	return (
		<div className="relative flex flex-col items-center justify-center">
			<AboutPageContent data={data} />
			{data?.cta && <PageCta {...data.cta} />}
		</div>
	);
}
