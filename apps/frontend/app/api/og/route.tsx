import { capitalize } from "@/utils/strings";
import { ImageResponse } from "next/og";
import Automation from "./templates/Automation";
import AutomationToFrom from "./templates/AutomationToFrom";
import Base from "./templates/Base";
import BlogArticle from "./templates/BlogArticle";
import Job from "./templates/Job";
import Registry from "./templates/Registry";

export const runtime = "edge";

const BaseTemplate = ({ title }) => {
	return <Base title={title} />;
};

const DynamicTemplate = ({ searchParams }) => {
	const type = searchParams.get("type");
	const title = searchParams.get("title");
	const jobLocation = searchParams.get("jobLocation");
	const jobDepartment = searchParams.get("jobDepartment");
	const blogAuthors = searchParams.get("blogAuthors");
	const automationAuthor = searchParams.get("automationAuthor");
	const automationFrom = searchParams.get("automationFrom");
	const automationTo = searchParams.get("automationTo");

	return type === "blog.article" || type === "blog.customerStory" ? (
		<BlogArticle
			title={title}
			authors={blogAuthors.split("::").map((author) => ({
				name: capitalize(author?.split(";")?.[0] || ""),
				image: author.split(";")?.[1] || "",
			}))}
		/>
	) : type === "automation" && automationTo ? (
		<AutomationToFrom
			title={title}
			automationFrom={{
				framework: capitalize(automationFrom?.split(";")?.[0] || ""),
				image: automationFrom.split(";")[1],
			}}
			automationTo={{
				framework: capitalize(automationTo?.split(";")?.[0] || ""),
				image: automationTo?.split(";")?.[1] || "",
			}}
		/>
	) : type === "automation" ? (
		<Automation
			title={title}
			automationAuthor={{
				name: automationAuthor?.split(";")?.[0] || "",
				image: automationAuthor?.split(";")?.[1] || "",
			}}
			automationFrom={{
				framework: capitalize(automationFrom?.split(";")?.[0] || ""),
				image: automationFrom?.split(";")?.[1] || "",
			}}
		/>
	) : type === "job" ? (
		<Job title={title} location={jobLocation} department={jobDepartment} />
	) : (
		<BaseTemplate title={title} />
	);
};
const RegistryTemplate = ({ title }) => {
	return (
		<Registry
			title={title}
			imageUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/registry.png`}
		/>
	);
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	const fontDataPromises = [
		fetch(new URL("../../../fonts/Satoshi-Bold.ttf", import.meta.url)).then(
			(res) => res.arrayBuffer(),
		),
		fetch(new URL("../../../fonts/Satoshi-Medium.ttf", import.meta.url)).then(
			(res) => res.arrayBuffer(),
		),
		fetch(new URL("../../../fonts/Satoshi-Regular.ttf", import.meta.url)).then(
			(res) => res.arrayBuffer(),
		),
	];

	const [fontDataBold, fontDataMedium, fontDataRegular] =
		await Promise.all(fontDataPromises);

	const title = searchParams.get("title");
	const type = searchParams.get("type") || "";

	const isDynamicTemplate = [
		"blog.article",
		"blog.customerStory",
		"job",
		"automation",
	].includes(type);
	const isRegistryTemplate = type === "registryIndex";

	return new ImageResponse(
		isRegistryTemplate ? (
			<RegistryTemplate title={title} />
		) : isDynamicTemplate ? (
			<DynamicTemplate searchParams={searchParams} />
		) : (
			<BaseTemplate title={title} />
		),

		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: "Satoshi-Bold",
					data: fontDataBold,
					weight: 700,
					style: "normal",
				},
				{
					name: "Satoshi-Medium",
					data: fontDataMedium,
					weight: 600,
					style: "normal",
				},
				{
					name: "Satoshi-Regular",
					data: fontDataRegular,
					weight: 400,
					style: "normal",
				},
			],
		},
	);
}
