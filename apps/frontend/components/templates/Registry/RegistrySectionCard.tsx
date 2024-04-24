"use client";

import Icon from "@/components/shared/Icon";
import { SanityImage } from "@/components/shared/SanityImage";
import { SanityLink } from "@/components/shared/SanityLink";
import Tag from "@/components/shared/Tag";
import { REGISTRY_FILTER_TYPES } from "@/constants";
import type { RegistryCardData } from "@/types/object.types";
import { capitalize, unslugify } from "@/utils/strings";
import VerifiedBadge from "./VerifiedBadge";
import {
  getAutomationFramworkTitle,
  getAutomationPathname,
  getFilterIcon,
  getFilterSection,
  getFormattedDescription,
} from "./helpers";

export default function RegistrySectionCard(
  props: RegistryCardData & {
    onFilter: (key?: string | null, value?: string | null) => void;
  },
) {
  const framework = capitalize(getAutomationFramworkTitle(props));

  const formattedDescription = getFormattedDescription(
    props.shortDescription || "",
  );

  const frameworkIcons = getFilterSection(
    "framework",
    props.filterIconDictionary,
  );
  const frameworkImage = getFilterIcon(
    frameworkIcons,
    getAutomationFramworkTitle(props),
  );

  const authorIcons = getFilterSection("author", props.filterIconDictionary);
  const authorImage = getFilterIcon(authorIcons, props.author);

  const categoryIcons = getFilterSection(
    "category",
    props.filterIconDictionary,
  );

  const categoryImage = getFilterIcon(
    categoryIcons,
    props.useCaseCategory?.toLocaleLowerCase() || "",
  );

  return (
    <li
      tabIndex={0}
      className="flex flex-col items-start gap-m py-l transition-[width] focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light dark:focus-visible:ring-border-dark"
    >
      <div className="flex flex-col items-start">
        <div>
          {props.featured && <span className="tag">Featured</span>}
          <SanityLink
            link={{
              _type: "link",
              href: getAutomationPathname(props.slug),
            }}
          >
            <h3 className="xs-heading mt-3 hover:underline">
              {unslugify(props.name || "Untitled Automation")}
            </h3>
          </SanityLink>
          <p
            className="body-l line-clamp-3"
            dangerouslySetInnerHTML={{ __html: formattedDescription }}
          ></p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-m lg:flex-row lg:justify-between">
        <div className="flex items-center gap-xs">
          {props.verified && <VerifiedBadge content={props.verifiedTooltip} />}
          {framework && (
            <button
              onClick={() =>
                props.onFilter &&
                props.onFilter(REGISTRY_FILTER_TYPES.framework, framework)
              }
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
                <span>{capitalize(framework)}</span>
              </Tag>
            </button>
          )}
          {props.useCaseCategory && (
            <button
              onClick={() =>
                props.onFilter &&
                props.onFilter(
                  REGISTRY_FILTER_TYPES.useCase,
                  props.useCaseCategory,
                )
              }
            >
              <Tag intent="default">
                {categoryImage.icon && <Icon name={categoryImage.icon} />}
                {capitalize(props.useCaseCategory)}
              </Tag>
            </button>
          )}
        </div>

        {props.author && (
          <button
            onClick={() =>
              props.onFilter &&
              props.onFilter(REGISTRY_FILTER_TYPES.owner, props.author)
            }
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
                {capitalize(props.author)}
              </span>
            </div>
          </button>
        )}
      </div>
    </li>
  );
}
