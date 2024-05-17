"use client";

import type { QueryResponseInitial } from "@sanity/react-loader";

import PageCta from "@/components/templates/ModularPage/PageCta";
import { CONTACT_PAGE_QUERY } from "@/data/sanity/queries";
import { useQuery } from "@/data/sanity/useQuery";
import type { ContactPagePayload } from "@/types";
import ContactPageUI from "./ContactPageUI";

type Props = {
  params: { pathname: string };
  initial: QueryResponseInitial<ContactPagePayload | null>;
};

export default function ContactPagePreview(props: Props) {
  let { params, initial } = props;
  let { data } = useQuery<ContactPagePayload | null>(
    CONTACT_PAGE_QUERY,
    params,
    {
      initial,
    },
  );

  return (
    <>
      <ContactPageUI data={data} />
      {data?.cta && <PageCta {...data.cta} />}
    </>
  );
}
