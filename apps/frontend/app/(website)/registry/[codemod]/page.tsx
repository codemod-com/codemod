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

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function generateStaticParams() {
  // we dont want to generate all pages in the deployment preview, because it consumes a lot of ISR cache writes
  // and makes deploys slower
  // pages will be generated on demand as we have dynamicParams true
  if (env.IS_PREVIEW) {
    return [];
  }

  const baseUrl = env.NEXT_PUBLIC_CODEMOD_AUTOMATIONS_LIST_ENDPOINT;
  const res = await fetchWithTimeout(`${baseUrl}/list`);
  const allAutomations = res.status === 200 ? await res.json() : [];
  return allAutomations.map((automation) => ({ codemod: automation.slug }));
}

export async function generateMetadata(
  props: RouteProps,
  parent: ResolvingMetadata,
) {
  const codemod = (props.params as unknown as { codemod: string })?.codemod;

  const initialAutomationData = await loadCodemod(codemod, {
    next: {
      tags: [`codemod-${codemod}`],
      revalidate: ONE_WEEK,
    },
  });

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
  const initialAutomationData = await loadCodemod(params.codemod, {
    next: {
      tags: [`codemod-${params.codemod}`],
      revalidate: ONE_WEEK,
    },
  });

  if (!initialAutomationData || "error" in initialAutomationData) {
    notFound();
  }

  const automationPageData = await loadAutomationPage(
    initialAutomationData.tags,
    ONE_WEEK,
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
