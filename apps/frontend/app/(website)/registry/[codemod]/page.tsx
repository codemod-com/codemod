import Markdown from "@/components/global/ReactMarkdown";
import CodemodPage from "@/components/templates/CodemodPage/Page";
import { transformAutomation } from "@/components/templates/Registry/helpers";
import { fetchWithTimeout, loadCodemod } from "@/data/codemod/loaders";
import { loadAutomationPage } from "@/data/sanity/loadQuery";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import { env } from "@/env";
import type { RouteProps } from "@/types";
import { vercelStegaCleanAll } from "@sanity/client/stega";
import type { ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

export const dynamicParams = true;

export async function generateStaticParams() {
  const baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  const res = await fetchWithTimeout(`${baseUrl}/list`);
  const allAutomations = res.status === 200 ? await res.json() : [];
  return allAutomations.map((automation) => ({ codemod: automation.slug }));
}

export async function generateMetadata(
  props: RouteProps,
  parent: ResolvingMetadata,
) {
  const initialAutomationData = await loadCodemod(
    (props.params as unknown as { codemod: string })?.codemod,
  );

  if (!initialAutomationData || "error" in initialAutomationData) {
    notFound();
  }

  const automationPageData = await loadAutomationPage(
    initialAutomationData.tags,
  );
  const pageData = transformAutomation({
    ...initialAutomationData,
    ...automationPageData?.data,
  });

  return resolveSanityRouteMetadata(pageData, parent);
}

export default async function CodemodRoute({ params }) {
  const initialAutomationData = await loadCodemod(params.codemod);

  if (!initialAutomationData || "error" in initialAutomationData) {
    notFound();
  }

  const automationPageData = await loadAutomationPage(
    initialAutomationData.tags,
  );
  const pageData = transformAutomation({
    ...initialAutomationData,
    ...automationPageData?.data,
  });

  const description = pageData?.shortDescription ? (
    <Markdown>{vercelStegaCleanAll(pageData?.shortDescription || "")}</Markdown>
  ) : null;

  return <CodemodPage description={description} data={pageData} />;
}

export const revalidate = 600;
