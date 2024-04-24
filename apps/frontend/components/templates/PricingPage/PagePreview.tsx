"use client";

import type { QueryResponseInitial } from "@sanity/react-loader";

import { useQuery } from "@/data/sanity/useQuery";
import type { PricingPagePayload } from "@/types";

import PageCta from "@/components/templates/ModularPage/PageCta";
import { PRICING_PAGE_QUERY } from "@/data/sanity/queries";
import { SectionsRenderer } from "../../SectionsRenderer";
import { sections } from "../../sections/sections.preview";
import PricingContent from "./PricingContent";

type Props = {
  params: { pathname: string };
  initial: QueryResponseInitial<PricingPagePayload | null>;
};

export default function PricingPagePreview(props: Props) {
  const { params, initial } = props;
  const { data } = useQuery<PricingPagePayload | null>(
    PRICING_PAGE_QUERY,
    params,
    {
      initial,
    },
  );

  return (
    <div className="relative flex flex-col items-center justify-center">
      <PricingContent data={data!} />
      <SectionsRenderer
        sections={data?.sections ?? []}
        fieldName="sections"
        componentsMap={sections}
      />
      {data?.cta && <PageCta {...data.cta} />}
    </div>
  );
}
