"use client";

import type { QueryResponseInitial } from "@sanity/react-loader";

import { useQuery } from "@/data/sanity/useQuery";
import type { ModularPagePayload } from "@/types";

import PageCta from "@/components/templates/ModularPage/PageCta";
import { PAGE_QUERY } from "@/data/sanity/queries";
import { SectionsRenderer } from "../../SectionsRenderer";
import { sections } from "../../sections/sections.preview";
import I18nPageContent from "./I18nPageContent";

type PreviewRouteProps = {
  initial: QueryResponseInitial<ModularPagePayload | null>;
};

export default function I18NPagePreview(props: PreviewRouteProps) {
  const { initial } = props;

  const { data } = useQuery<ModularPagePayload | null>(
    PAGE_QUERY,
    {
      pathname: "i18n",
      locale: "en",
    },
    {
      initial,
    },
  );

  return (
    <div className="relative flex flex-col items-center justify-center">
      {data && <I18nPageContent data={data} />}
      <SectionsRenderer
        sections={data?.sections ?? []}
        fieldName="sections"
        componentsMap={sections}
      />
      {data?.cta && <PageCta {...data.cta} />}
    </div>
  );
}
