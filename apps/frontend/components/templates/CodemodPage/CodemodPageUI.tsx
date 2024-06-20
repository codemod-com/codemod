import Button from "@/components/shared/Button";
import Icon from "@/components/shared/Icon";
import LinkButton from "@/components/shared/LinkButton";
import { SanityImage } from "@/components/shared/SanityImage";
import Section from "@/components/shared/Section";
import Snippet from "@/components/shared/Snippet";
import Tag from "@/components/shared/Tag";
import { REGISTRY_FILTER_TYPES } from "@/constants";
import type { CodemodPagePayload } from "@/types";
import { capitalize, unslugify } from "@/utils/strings";
import { vercelStegaCleanAll } from "@sanity/client/stega";
import { vercelStegaSplit } from "@vercel/stega";
import Link from "next/link";
import VerifiedBadge from "../Registry/VerifiedBadge";
import {
  getAutomationFramworkTitle,
  getFilterIcon,
  getFilterSection,
} from "../Registry/helpers";
import InfoTooltip from "./parts/InfoTooltip";

export interface CodemodPageProps {
  data: CodemodPagePayload | null;
  description: JSX.Element | null;
}

export default function CodemodPageUI({ data, description }: CodemodPageProps) {
  let framework = getAutomationFramworkTitle(data);

  let { cleaned: author } = vercelStegaSplit(`${data?.author}`);

  let frameworkIcons = getFilterSection(
    REGISTRY_FILTER_TYPES.framework,
    data?.filterIconDictionary,
  );

  let frameworkImage = getFilterIcon(frameworkIcons, framework);
  let authorIcons = getFilterSection("author", data?.filterIconDictionary);

  let authorImage = getFilterIcon(authorIcons, author);

  let categoryIcons = getFilterSection(
    "category",
    data?.filterIconDictionary,
  );

  let categoryImage = getFilterIcon(
    categoryIcons,
    data?.useCaseCategory?.toLocaleLowerCase() || "",
  );

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
              <>
                {framework && (
                  <Link
                    href={`/registry?${
                      REGISTRY_FILTER_TYPES.framework
                    }=${framework.toLowerCase()}`}
                    prefetch
                  >
                    <Tag intent="default">
                      <>
                        {frameworkImage?.image.light && (
                          <SanityImage
                            maxWidth={20}
                            image={frameworkImage.image.light}
                            alt={frameworkImage.image.light.alt}
                            elProps={{
                              width: 20,
                              height: 20,
                              className: "h-5 w-5 dark:hidden",
                            }}
                          />
                        )}

                        {frameworkImage?.image.dark && (
                          <SanityImage
                            maxWidth={20}
                            image={frameworkImage.image.dark}
                            alt={frameworkImage.image.dark.alt}
                            elProps={{
                              width: 20,
                              height: 20,
                              className: "hidden h-5 w-5 dark:inline",
                            }}
                          />
                        )}
                      </>

                      <span className="capitalize">
                        {capitalize(framework)}
                      </span>
                    </Tag>
                  </Link>
                )}
              </>
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
              <Link
                href={`/registry?${
                  REGISTRY_FILTER_TYPES.owner
                }=${vercelStegaCleanAll(data?.author)}`}
                className="rounded-sm focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light dark:focus-visible:ring-border-dark"
                prefetch
              >
                <div className="flex items-center gap-xs">
                  <span className="body-s-medium font-medium">by</span>

                  <>
                    {authorImage?.image.light && (
                      <SanityImage
                        maxWidth={20}
                        image={authorImage.image.light}
                        alt={authorImage.image.light.alt}
                        elProps={{
                          width: 20,
                          height: 20,
                          className: "h-5 w-5 dark:hidden",
                        }}
                      />
                    )}

                    {authorImage?.image.dark && (
                      <SanityImage
                        maxWidth={20}
                        image={authorImage.image.dark}
                        alt={authorImage.image.dark.alt}
                        elProps={{
                          width: 20,
                          height: 20,
                          className: "hidden h-5 w-5 dark:inline",
                        }}
                      />
                    )}
                  </>
                  <span className="body-s-medium font-medium">
                    {data?.author}
                  </span>
                </div>
              </Link>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-[12px]">
            {data?.automationName && (
              <h1 className="m-heading">{unslugify(data?.automationName)}</h1>
            )}
          </div>

          <div className="mt-6 flex items-center gap-s rounded-[8px] border border-border-light p-s dark:border-border-dark">
            {framework && (
              <InfoCard
                value={capitalize(framework)}
                label="Made for"
                icon="/icons/badge-info.svg"
              />
            )}
            {framework && (
              <span className="h-full w-[2px] bg-border-light dark:bg-border-dark" />
            )}
            {data?.currentVersion?.updatedAt && (
              <InfoCard
                value={new Date(data?.currentVersion?.updatedAt).toLocaleString(
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
        <aside className="top-8 flex h-fit w-full flex-col gap-m lg:sticky lg:w-1/3 lg:min-w-[360px] lg:pl-[52px]">
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
            {data?.currentVersion?.vsCodeLink && (
              <div className="flex flex-col gap-xs">
                <p className="body-s">
                  {data.globalLabels?.vsCodeExtensionTitle ||
                    "VS Code extension"}
                </p>
                <Button
                  iconPosition="left"
                  icon="noborder-vscode"
                  intent="secondary"
                >
                  <a href={data?.currentVersion?.vsCodeLink}>
                    {data.globalLabels?.vsCodeExtensionButtonLabel ||
                      "Run in VS Code"}
                  </a>
                </Button>
              </div>
            )}

            {data?.currentVersion?.codemodStudioExampleLink && (
              <div className="flex flex-col gap-xs">
                <p className="body-s">
                  {data.globalLabels?.codemodStudioExampleTitle ||
                    "Codemod Studio"}
                </p>
                <Button arrow intent="secondary">
                  <a href={data?.currentVersion?.codemodStudioExampleLink}>
                    {data.globalLabels?.codemodStudioExampleButtonLabel ||
                      "Run in Codemod Studio"}
                  </a>
                </Button>
              </div>
            )}

            {data?.currentVersion?.testProjectCommand && (
              <div className="flex flex-col gap-xs">
                <p className="body-s">
                  {data.globalLabels?.textProjectTitle || "Example Project"}
                </p>
                <Snippet
                  variant="secondary"
                  command={data?.currentVersion?.testProjectCommand}
                />
              </div>
            )}
            {data?.currentVersion?.sourceRepo && (
              <div className="flex flex-col gap-xs">
                <div className="flex items-center">
                  <p className="body-s">
                    {data.globalLabels?.sourceRepoTitle || "Repository"}
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
                    href={data?.currentVersion?.sourceRepo}
                    className="truncate underline"
                    rel="noreferrer"
                  >
                    {data?.currentVersion?.sourceRepo}
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
              <InfoCard
                value={String(data?.currentVersion?.totalTimeSaved)}
                label="Total time saved"
              />
              <span className="h-[36px] w-[2px] bg-border-light dark:bg-border-dark" />
              <InfoCard
                value={String(data?.currentVersion?.version)}
                label="Version"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(data?.currentVersion?.tags?.filter(Boolean).length || 0) >
                0 && (
                <>
                  <span className="h-px w-full bg-border-light dark:bg-border-dark" />
                  {data?.currentVersion?.tags?.filter(Boolean).map((label) => (
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
          {data?.globalLabels?.cta?.link && (
            <div className="relative flex w-full flex-col gap-s overflow-clip rounded-[8px] border border-border-light p-s dark:border-border-dark">
              {data?.globalLabels?.ctaTitle && (
                <div className="relative z-10 flex flex-col gap-[12px]">
                  <p className="xs-heading">
                    {data?.globalLabels?.ctaTitle || "Build custom codemods"}
                  </p>
                  {data?.globalLabels?.ctaDescription && (
                    <p className="body-s">
                      {data?.globalLabels?.ctaDescription}
                    </p>
                  )}
                </div>
              )}
              <img
                className="pointer-events-none absolute left-0 top-[60px] -z-10 w-full"
                alt="background illustration"
                src="/illustration/planet.svg"
              />
              <LinkButton href={data?.globalLabels?.cta?.link} intent="primary">
                {data?.globalLabels?.cta?.label || "Get started now"}
              </LinkButton>
            </div>
          )}
        </aside>
        {description ? (
          <div className="[&_h1]:s-heading [&_h2]:xs-heading flex flex-col gap-4 lg:hidden [&_a]:underline">
            {description}
          </div>
        ) : null}
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
  value: string;
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
