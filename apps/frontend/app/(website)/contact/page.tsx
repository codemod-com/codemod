import ContactPage from "@/components/templates/ContactPage/Page";
import { loadContactPage } from "@/data/sanity";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { RouteProps } from "@/types";
import type { ResolvingMetadata } from "next";
import dynamic from "next/dynamic";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

let ContactPagePreview = dynamic(
  () => import("@/components/templates/ContactPage/PagePreview"),
);

export async function generateMetadata(
  props: RouteProps,
  parent: ResolvingMetadata,
) {
  let initialData = await loadContactPage("/contact");

  if (!initialData?.data) return notFound();

  return resolveSanityRouteMetadata(initialData.data, parent);
}

export default async function Contact() {
  let initial = await loadContactPage("/contact");

  if (draftMode().isEnabled) {
    return (
      <ContactPagePreview initial={initial} params={{ pathname: "/contact" }} />
    );
  }

  return <ContactPage data={initial.data} />;
}
