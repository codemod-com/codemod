import Button from "@/components/shared/Button";
import Icon from "@/components/shared/Icon";
import LinkButton from "@/components/shared/LinkButton";
import RunCTAButton from "@/components/shared/RunCTAButton";
import { SanityImage } from "@/components/shared/SanityImage";
import Section from "@/components/shared/Section";
import Snippet from "@/components/shared/Snippet";
import Tag from "@/components/shared/Tag";
import { AuthorSection } from "@/components/templates/CodemodPage/AuthorSection";
import { VCCodeShift } from "@/components/templates/CodemodPage/VCCodeShift";
import { getCodemodCard } from "@/components/templates/CodemodPage/buildYourCodemodCard";
import { getFrameworkCard } from "@/components/templates/CodemodPage/getFrameworkCard";
import {
  CURSOR_PREFIX,
  REGISTRY_FILTER_TYPES,
  VSCODE_PREFIX,
} from "@/constants";
import type { CodemodPagePayload } from "@/types";
import { capitalize, unslugify } from "@/utils/strings";
import { vercelStegaCleanAll } from "@sanity/client/stega";
import { vercelStegaSplit } from "@vercel/stega";
import Link from "next/link";
import type { ReactNode } from "react";
import VerifiedBadge from "../Registry/VerifiedBadge";
import {
  getAutomationFrameworkTitles,
  getFilterIcon,
  getFilterSection,
} from "../Registry/helpers";
import InfoTooltip from "./parts/InfoTooltip";

export interface CodemodPageProps {
  data: CodemodPagePayload | null;
  description: JSX.Element | null;
}

export default function CodemodPageUI({ data, description }: CodemodPageProps) {
  const { cleaned: author } = vercelStegaSplit(`${data?.author}`);

  const frameworkIcons = getFilterSection(
    REGISTRY_FILTER_TYPES.framework,
    data?.filterIconDictionary,
  );

  const authorHref = `/registry?${
    REGISTRY_FILTER_TYPES.owner
  }=${vercelStegaCleanAll(author)}`;

  const frameworks = getAutomationFrameworkTitles(data).map((framework) => ({
    name: framework,
    image: getFilterIcon(frameworkIcons, framework),
  }));

  const frameworksDescription =
    !frameworks.length ? null : frameworks.length === 1 ? (
      capitalize(frameworks[0]?.name!)
    ) : (
      <ul className="list-disc body-s">
        {frameworks.map(({ name, image }) => (
          <li className="body-s" key={name}>
            {capitalize(name)}
          </li>
        ))}
      </ul>
    );
  const authorIcons = getFilterSection("author", data?.filterIconDictionary);
  const authorImage = getFilterIcon(authorIcons, author);
  const buildYourCodemodCard = getCodemodCard(data);
  const frameworkCards = frameworks.map(getFrameworkCard);
  const categoryIcons = getFilterSection(
    "category",
    data?.filterIconDictionary,
  );

  const categoryImage = getFilterIcon(
    categoryIcons,
    data?.useCaseCategory?.toLocaleLowerCase() || "",
  );

  const currentVersion = data?.versions[0];

  return (
    <Section className="pt-[calc(var(--header-height)+24px)]">
      <div className="py-8">
        <Link
          className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold"
          href={"/registry"}
          prefetch
        >
          <Icon name="arrow-left" className="w-3" />
          {data?.globalLabels?.backToIndex || "Back"}
        </Link>
      </div>

      <div className="relative flex w-full flex-col gap-l pb-xl lg:flex lg:flex-row lg:gap-2xl lg:pb-[80px]">
        <div className="flex w-full flex-col lg:w-2/3">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-xs">
              {data?.verified && (
                <VerifiedBadge content="Regularly tested and maintained by our engineers and codemod expert community." />
              )}
              {frameworkCards}
              {data?.useCaseCategory && (
                <Link
                  href={`/registry?${
                    REGISTRY_FILTER_TYPES.useCase
                  }=${vercelStegaCleanAll(data?.useCaseCategory)}`}
                  prefetch
                >
                  <Tag intent="default">
                    {categoryImage.icon && <Icon name={categoryImage.icon} />}
                    <span className="capitalize">{data?.useCaseCategory}</span>
                  </Tag>
                </Link>
              )}
            </div>
            {/* Attribution */}
            {data?.author && (
              <AuthorSection
                author={data?.author}
                href={authorHref}
                authorImage={authorImage}
              />
            )}
          </div>

          <div className="mt-6 flex flex-col gap-[12px]">
            {data?.automationName && (
              <h1 className="m-heading">{unslugify(data?.automationName)}</h1>
            )}
          </div>

          <div className="mt-6 flex items-center gap-s rounded-[8px] border border-border-light p-s dark:border-border-dark">
            {frameworks.length ? (
              <>
                <InfoCard
                  value={frameworksDescription}
                  label="Made for"
                  icon="/icons/badge-info.svg"
                />
                <span className="h-full w-[2px] bg-border-light dark:bg-border-dark" />
              </>
            ) : null}
            {currentVersion?.updatedAt && (
              <InfoCard
                value={new Date(currentVersion?.updatedAt).toLocaleString(
                  "en-us",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
                label="Last update"
                icon="/icons/calendar.svg"
              />
            )}
          </div>
          {description ? (
            <div className=" [&_code]:inline-code mt-10 hidden flex-col gap-4 lg:flex [&_a]:underline">
              {description}
            </div>
          ) : null}
        </div>
        {/* Sidebar */}
        <aside className="lg:top-[128px] flex h-fit w-full flex-col gap-m lg:sticky lg:w-1/3 lg:min-w-[360px] lg:pl-[52px]">
          {/* Run */}

          <div className="flex w-full flex-col gap-s rounded-[8px] border border-border-light p-s dark:border-border-dark">
            <div className="flex items-center justify-between">
              <p className="xs-heading">Run</p>
              {data?.globalLabels?.documentationPopup && (
                <InfoTooltip
                  cta={data.globalLabels.documentationPopupLink}
                  content={data?.globalLabels?.documentationPopup}
                />
              )}
            </div>
            {data?.automationName && (
              <div className="flex flex-col gap-xs">
                <p className="body-s">
                  {data.globalLabels?.runCommandTitle || "CLI"}
                </p>
                <Snippet
                  variant="secondary"
                  command={`${
                    data?.globalLabels?.runCommandPrefix || "codemod"
                  } ${data.automationName}`}
                />
              </div>
            )}
            {currentVersion?.vsCodeLink && (
              <VCCodeShift {...data} currentVersion={currentVersion} />
            )}

            {currentVersion?.codemodStudioExampleLink && (
              <div className="flex flex-col gap-xs">
                <p className="body-s">
                  {data?.globalLabels?.codemodStudioExampleTitle ||
                    "Codemod Studio"}
                </p>
                <Button arrow intent="secondary">
                  <a href={currentVersion?.codemodStudioExampleLink}>
                    {data?.globalLabels?.codemodStudioExampleButtonLabel ||
                      "Run in Codemod Studio"}
                  </a>
                </Button>
              </div>
            )}

            {currentVersion?.testProjectCommand && (
              <div className="flex flex-col gap-xs">
                <p className="body-s">
                  {data?.globalLabels?.textProjectTitle || "Example Project"}
                </p>
                <Snippet
                  variant="secondary"
                  command={currentVersion?.testProjectCommand}
                />
              </div>
            )}
            {currentVersion?.sourceRepo && (
              <div className="flex flex-col gap-xs">
                <div className="flex items-center">
                  <p className="body-s">
                    {data?.globalLabels?.sourceRepoTitle || "Repository"}
                  </p>
                  {/* <div className="flex gap-2">
                    <img src="/icons/star.svg" alt="GitHub icon" />
                    <p>1.7K</p>
                  </div> */}
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src="/logotypes/light/github.svg"
                    className="dark:hidden"
                    alt="GitHub icon"
                  />
                  <img
                    src="/logotypes/dark/github.svg"
                    className="hidden dark:block"
                    alt="GitHub icon"
                  />
                  <a
                    target="_blank"
                    href={currentVersion?.sourceRepo}
                    className="truncate underline"
                    rel="noreferrer"
                  >
                    {currentVersion?.sourceRepo}
                  </a>
                </div>
              </div>
            )}
            {/* <span className="h-px w-full bg-border-light dark:bg-border-dark" />
            <div>
              <p className="xs-heading">About</p>
            </div>
            <div className="flex justify-between gap-4">
              <LineChart data={placeholders.chartData} />

              <div className="flex-1" />
            </div> */}
            <span className="h-px w-full bg-border-light dark:bg-border-dark" />
            <div className="flex items-center gap-s">
              <InfoCard value={String(data?.totalRuns)} label="Total runs" />
              <span className="h-[36px] w-[2px] bg-border-light dark:bg-border-dark" />
              <InfoCard
                value={String(currentVersion?.version)}
                label="Version"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(currentVersion?.tags?.filter(Boolean).length || 0) > 0 && (
                <>
                  <span className="h-px w-full bg-border-light dark:bg-border-dark" />
                  {currentVersion?.tags?.filter(Boolean).map((label) => (
                    <Link prefetch key={label} href={`/registry?q=${label}`}>
                      <Tag key={label}>{label}</Tag>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
          {/* To be used once we finalize linking to customer stories */}
          {/* {!!data?.automationStories?.length && (
            <div className="relative flex w-full flex-col gap-s overflow-clip rounded-[8px] border border-border-light p-s dark:border-border-dark">
              <h5 className="xs-heading">Customer Stories</h5>
              {data?.automationStories?.map((story, idx, arr) => (
                <>
                  <div key={story.title} className="flex flex-col gap-2">
                    <p className="body-l">{story.tagline}</p>
                    <Link
                      className="body-s-medium flex"
                      key={story.title}
                      href={`${story.pathname}`}
                      prefetch
                    >
                      Learn More <Icon name="chevron-right" className="w-3" />
                    </Link>
                  </div>
                  {idx !== arr.length - 1 && (
                    <span className="h-px w-full bg-border-light dark:bg-border-dark" />
                  )}
                </>
              ))}
            </div>
          )} */}
          <span className="hidden sm:block">{buildYourCodemodCard}</span>
        </aside>
        {description ? (
          <div className="[&_h1]:s-heading [&_h2]:xs-heading flex flex-col gap-4 lg:hidden [&_a]:underline">
            {description}
          </div>
        ) : null}
        <span className="sm:hidden block">{buildYourCodemodCard}</span>
      </div>
    </Section>
  );
}

export function InfoCard({
  icon,
  label,
  value,
}: {
  label: string;
  value: ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex w-full gap-[12px]">
      {icon && <img className="h-[20px] w-[20px]" src={icon} alt={icon} />}
      <div>
        <p className="body-s whitespace-nowrap">{label}</p>
        <p className="whitespace-nowrap font-medium text-[18px]">{value}</p>
      </div>
    </div>
  );
}
