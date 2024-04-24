import { SectionsRenderer } from "@/components/SectionsRenderer";
import PageHero from "@/components/templates/ModularPage/PageHero";
import type { ModularPagePayload } from "@/types";
import { sections as sectionComponents } from "../../sections/sections.server";
import PageCta from "./PageCta";

export interface ModularPageProps {
	data: ModularPagePayload;
}

export function Page({ data }: ModularPageProps) {
	return (
		<div className="relative flex flex-col items-center justify-center">
			{data?.hero && <PageHero {...data.hero} />}
			<SectionsRenderer
				initialAutomations={data?.initialAutomations}
				sections={data?.sections ?? []}
				fieldName="sections"
				componentsMap={sectionComponents}
			/>
			{data?.cta && <PageCta {...data.cta} />}
		</div>
	);
}
