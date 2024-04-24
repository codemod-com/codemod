import { AboutPage } from "@/components/templates/AboutPage/Page";
import AboutPagePreview from "@/components/templates/AboutPage/PagePreview";
import { loadAboutPage } from "@/data/sanity";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { RouteProps } from "@/types";
import type { ResolvingMetadata } from "next";
import dynamic from "next/dynamic";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

export async function generateMetadata(
  props: RouteProps,
  parent: ResolvingMetadata,
) {
  const initialData = await loadAboutPage("/about");

  if (!initialData?.data) return notFound();

  return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function About() {
  const initial = await loadAboutPage("/about");

  if (!initial?.data) return notFound();

  if (draftMode().isEnabled) {
    return (
      <AboutPagePreview initial={initial} params={{ pathname: "/contact" }} />
    );
  }

  return <AboutPage data={initial.data} />;
}
