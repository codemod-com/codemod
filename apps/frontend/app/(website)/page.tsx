import { Page } from "@/components/templates/ModularPage/Page";
import { loadModularPage } from "@/data/sanity";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { RouteProps } from "@/types";
import type { ResolvingMetadata } from "next";

import { ThemeProvider } from "@/app/context";
import dynamic from "next/dynamic";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

let PagePreview = dynamic(
  () => import("@/components/templates/ModularPage/PagePreview"),
);

export async function generateMetadata(
  props: RouteProps,
  parent: ResolvingMetadata,
) {
  let pathname = `/`;
  let initialData = await loadModularPage(pathname);

  if (!initialData?.data) {
    return notFound();
  }

  return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function IndexRoute() {
  let pathname = `/`;
  let initial = await loadModularPage(pathname);

  return draftMode().isEnabled ? (
    <PagePreview initial={initial} />
  ) : (
    <Page data={initial.data!} />
  );
}
