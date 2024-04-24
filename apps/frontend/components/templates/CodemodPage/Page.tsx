import type { CodemodPagePayload } from "@/types";
import CodemodPageUI from "./CodemodPageUI";

export interface CodemodPageProps {
	data: CodemodPagePayload | null;
	description: JSX.Element | null;
}

export default async function CodemodPage({
	data,
	description,
}: CodemodPageProps) {
	return <CodemodPageUI description={description} data={data} />;
}
