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

export let dynamicParams = true;

export async function generateStaticParams() {
  let baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  let res = await fetchWithTimeout(`${baseUrl}/list`);
  let allAutomations = res.status === 200 ? await res.json() : [];
  return allAutomations.map((automation) => ({ codemod: automation.slug }));
}

export async function generateMetadata(
  props: RouteProps,
  parent: ResolvingMetadata,
) {
  let initialAutomationData = await loadCodemod(
    (props.params as unknown as { codemod: string })?.codemod,
  );

  if (!initialAutomationData || "error" in initialAutomationData) {
    notFound();
  }

  let automationPageData = await loadAutomationPage(
    initialAutomationData.tags,
  );
  let pageData = transformAutomation({
    ...initialAutomationData,
    ...automationPageData?.data,
  });

  return resolveSanityRouteMetadata(pageData, parent);
}

export default async function CodemodRoute({ params }) {
  let initialAutomationData = await loadCodemod(params.codemod, {
    next: {
      revalidate: 60 * 60 * 24 * 30,
      tags: [`codemod-${params.codemod}`],
    },
  });
  if (!initialAutomationData || "error" in initialAutomationData) {
    notFound();
  }

  let automationPageData = await loadAutomationPage(
    initialAutomationData.tags,
  );
  let pageData = transformAutomation({
    ...initialAutomationData,
    ...automationPageData?.data,
  });

  let description = pageData?.shortDescription ? (
    <Markdown>{vercelStegaCleanAll(pageData?.shortDescription || "")}</Markdown>
  ) : null;

  return <CodemodPage description={description} data={pageData} />;
}
