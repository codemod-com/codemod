import { I18nPage } from "@/components/templates/i18nPage/Page";
import I18NPagePreview from "@/components/templates/i18nPage/PagePreview";
import { loadSanityPageByRouteProps } from "@/data/sanity";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { RouteProps } from "@/types";
import type { ResolvingMetadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

export async function generateMetadata(
  props: RouteProps,
  parent: ResolvingMetadata,
) {
  const initialData = await loadSanityPageByRouteProps({
    params: {
      path: ["i18n"],
      locale: "",
    },
  });

  if (!initialData?.data) return notFound();

  return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function I18n() {
  const initial = await loadSanityPageByRouteProps({
    params: {
      path: ["i18n"],
      locale: "",
    },
  });

  if (!initial?.data) return notFound();

  if (draftMode().isEnabled) {
    return <I18NPagePreview initial={initial} />;
  }

  return <I18nPage data={initial.data} />;
}
