import CareersPage from "@/components/templates/CareersPage/Page";
import CareersPagePreview from "@/components/templates/CareersPage/PagePreview";
import { loadCareersPage } from "@/data/sanity";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { RouteProps } from "@/types";
import type { ResolvingMetadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

export async function generateMetadata(
  props: RouteProps,
  parent: ResolvingMetadata,
) {
  const initialData = await loadCareersPage("/careers");

  if (!initialData?.data) return notFound();

  return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function Careers() {
  const initial = await loadCareersPage("/careers");

  if (!initial?.data) return notFound();

  if (draftMode().isEnabled) {
    return (
      <CareersPagePreview initial={initial} params={{ pathname: "/careers" }} />
    );
  }

  return <CareersPage data={initial.data} />;
}
