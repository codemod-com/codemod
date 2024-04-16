import CodemodPage from "@/components/templates/CodemodPage/Page";
import CodeBlock from "@/components/templates/CodemodPage/parts/Code";
import { transformAutomation } from "@/components/templates/Registry/helpers";
import { loadCodemod } from "@/data/codemod/loaders";
import { loadAutomationPage } from "@/data/sanity/loadQuery";
import { vercelStegaCleanAll } from "@sanity/client/stega";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

export const dynamicParams = true;

export async function generateStaticParams() {
	const res = await fetch(`https://backend.codemod.com/codemods/list`);
	const allAutomations = await res.json();
	return allAutomations.map((automation) => ({ codemod: automation.slug }));
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
		<MDXRemote
			components={{
				pre: CodeBlock,
				Route: () => null,
			}}
			source={vercelStegaCleanAll(pageData?.shortDescription || "")}
		/>
	) : null;

	return <CodemodPage description={description} data={pageData} />;
}
