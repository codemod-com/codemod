import { capitalize } from "@/utils/strings";
import { ImageResponse } from "next/og";
import Automation from "./templates/Automation";
import AutomationToFrom from "./templates/AutomationToFrom";
import Base from "./templates/Base";
import BlogArticle from "./templates/BlogArticle";
import Job from "./templates/Job";
import Registry from "./templates/Registry";

export let runtime = "edge";

let BaseTemplate = ({ title }) => {
  return <Base title={title} />;
};

let DynamicTemplate = ({ searchParams }) => {
  let type = searchParams.get("type");
  let title = searchParams.get("title");
  let jobLocation = searchParams.get("jobLocation");
  let jobDepartment = searchParams.get("jobDepartment");
  let blogAuthors = searchParams.get("blogAuthors");
  let automationAuthor = searchParams.get("automationAuthor");
  let automationFrom = searchParams.get("automationFrom");
  let automationTo = searchParams.get("automationTo");

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
let RegistryTemplate = ({ title }) => {
  return (
    <Registry
      title={title}
      imageUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/registry.png`}
    />
  );
};

export async function GET(request: Request) {
  let { searchParams } = new URL(request.url);

  let fontDataPromises = [
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

  let [fontDataBold, fontDataMedium, fontDataRegular] =
    await Promise.all(fontDataPromises);

  let title = searchParams.get("title");
  let type = searchParams.get("type") || "";

  let isDynamicTemplate = [
    "blog.article",
    "blog.customerStory",
    "job",
    "automation",
  ].includes(type);
  let isRegistryTemplate = type === "registryIndex";

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
