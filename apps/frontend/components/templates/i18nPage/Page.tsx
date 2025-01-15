import { SectionsRenderer } from "@/components/SectionsRenderer";
import PageCta from "@/components/templates/ModularPage/PageCta";
import type { ModularPagePayload } from "@/types";
import { sections as sectionComponents } from "../../sections/sections.server";
import I18nPageContent from "./I18nPageContent";

export interface I18NPageProps {
  data: ModularPagePayload;
}

export function I18nPage({ data }: I18NPageProps) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <I18nPageContent data={data} />
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
