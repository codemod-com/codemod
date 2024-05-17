import type { ResolvingMetadata } from "next";
import dynamic from "next/dynamic";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { TokenBuilder } from "@/components/TokenBuilder";
import { Page } from "@/components/templates/ModularPage/Page";
import { loadModularPage } from "@/data/sanity";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { RouteProps } from "@/types";

const PagePreview = dynamic(
  () => import("@/components/templates/ModularPage/PagePreview"),
);

export async function generateMetadata(
  props: RouteProps,
  parent: ResolvingMetadata,
) {
  const pathname = `/`;
  const initialData = await loadModularPage(pathname);

  if (!initialData?.data) {
    return notFound();
  }

  return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function IndexRoute() {
  const pathname = `/`;
  const initial = await loadModularPage(pathname);

  return draftMode().isEnabled ? (
    <PagePreview initial={initial} />
  ) : (
    <>
      <TokenBuilder />
      <Page data={initial.data!} />
    </>
  );
}
