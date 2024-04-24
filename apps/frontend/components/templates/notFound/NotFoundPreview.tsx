"use client";

import PageCta from "@/components/templates/ModularPage/PageCta";
import { NOT_FOUND_DOC_QUERY } from "@/data/sanity/queries";
import { useQuery } from "@/data/sanity/useQuery";
import type { NotFoundPayload } from "@/types";
import { NotFoundHero } from "./NotFoundHero";

export const NotFoundPreview = ({ initial }) => {
  const { data } = useQuery<NotFoundPayload | null>(
    NOT_FOUND_DOC_QUERY,
    {
      locale: "en",
    },
    { initial },
  );
  return (
    <>
      <NotFoundHero data={data!} />
      {data?.footerCta && <PageCta {...data.footerCta} />}
    </>
  );
};
