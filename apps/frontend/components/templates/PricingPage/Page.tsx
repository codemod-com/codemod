import { SectionsRenderer } from "@/components/SectionsRenderer";
import PageCta from "@/components/templates/ModularPage/PageCta";
import type { PricingPagePayload } from "@/types";
import { sections as sectionComponents } from "../../sections/sections.server";
import PricingContent from "./PricingContent";

export interface PricingPageProps {
  data: PricingPagePayload;
}

export function PricingPage({ data }: PricingPageProps) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <PricingContent data={data} />
      <SectionsRenderer
        sections={data?.sections ?? []}
        fieldName="sections"
        componentsMap={sectionComponents}
      />
      {data?.cta && <PageCta {...data.cta} />}
    </div>
  );
}
