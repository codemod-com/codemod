import CodemodPage from "@/components/templates/CodemodPage/Page";
import CodeBlock from "@/components/templates/CodemodPage/parts/Code";
import { transformAutomation } from "@/components/templates/Registry/helpers";
import { fetchWithTimeout, loadCodemod } from "@/data/codemod/loaders";
import { loadAutomationPage } from "@/data/sanity/loadQuery";
import { resolveSanityRouteMetadata } from "@/data/sanity/resolveSanityRouteMetadata";
import type { RouteProps } from "@/types";
import { vercelStegaCleanAll } from "@sanity/client/stega";
import { cx } from "cva";
import type { ResolvingMetadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

export let dynamicParams = true;

export async function generateStaticParams() {
  let res = await fetchWithTimeout(
    `https://backend.codemod.com/codemods/list`,
  );
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
  let initialAutomationData = await loadCodemod(params.codemod);

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
    <MDXRemote
      components={{
        blockquote: ({ children }) => (
          <blockquote className={cx("mt-4 border-l-2 border-black pl-6")}>
            {children}
          </blockquote>
        ),
        pre: CodeBlock,
        strong: ({ children }) => <span className="font-bold">{children}</span>,
        em: ({ children }) => <em>{children}</em>,
        underline: ({ children }) => <u>{children}</u>,
        ul: ({ children }) => <ul className="list-disc p-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal p-2">{children}</ol>,
        h1: ({ children }) => <h1 className={cx("m-heading")}>{children}</h1>,
        h2: ({ children }) => <h2 className={cx("s-heading")}>{children}</h2>,
        h3: ({ children }) => (
          <h3 className={cx("xs-heading  py-4")}>{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className={cx("body-l-medium py-4")}>{children}</h4>
        ),
        h5: ({ children }) => (
          <h4 className={cx("body-m-medium py-2")}>{children}</h4>
        ),
        Route: () => null,
      }}
      source={vercelStegaCleanAll(pageData?.shortDescription || "")}
    />
  ) : null;

  return <CodemodPage description={description} data={pageData} />;
}
