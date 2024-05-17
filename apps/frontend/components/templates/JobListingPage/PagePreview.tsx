"use client";

import type { QueryResponseInitial } from "@sanity/react-loader";

import { useQuery } from "@/data/sanity/useQuery";

import { JOB_QUERY } from "@/data/sanity/queries";
import type { Job } from "@/types";
import JobListingPageContent from "./JobListingPageContent";

type Props = {
  params: { pathname: string | string[] };
  initial: QueryResponseInitial<Job | null>;
};

export default function JobListingPagePreview(props: Props) {
  let { params, initial } = props;
  let { data } = useQuery<Job | null>(JOB_QUERY, params, {
    initial,
  });

  return <JobListingPageContent {...data!} />;
}
