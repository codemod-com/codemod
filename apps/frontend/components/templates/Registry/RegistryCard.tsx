import Icon from "@/components/shared/Icon";
import { SanityImage } from "@/components/shared/SanityImage";
import { REGISTRY_FILTER_TYPES } from "@/constants";
import { useRegistryFilters } from "@/hooks/useRegistryFilters";
import type { RegistryCardData } from "@/types/object.types";
import { capitalize, unslugify } from "@/utils/strings";
import { vercelStegaSplit } from "@vercel/stega";
import { SanityLink } from "../../shared/SanityLink";
import Tag from "../../shared/Tag";
import VerifiedBadge from "./VerifiedBadge";
import {
  getAutomationFramworkTitle,
  getAutomationPathname,
  getFilterIcon,
  getFilterSection,
  getFormattedDescription,
} from "./helpers";

export default function RegistryCard(props: RegistryCardData) {
  let framework = getAutomationFramworkTitle(props);

  let { handleFilterChange, prefetchFilterChange } = useRegistryFilters();

  let { cleaned: author } = vercelStegaSplit(`${props.author}`);

  let formattedDescription = getFormattedDescription(
    props.shortDescription || "",
  );

  let frameworkIcons = getFilterSection(
    REGISTRY_FILTER_TYPES.framework,
    props.filterIconDictionary,
  );
  let frameworkImage = getFilterIcon(
    frameworkIcons,
    getAutomationFramworkTitle(props),
  );

  let authorIcons = getFilterSection("author", props.filterIconDictionary);
  let authorImage = getFilterIcon(authorIcons, author);

  let categoryIcons = getFilterSection(
    "category",
    props.filterIconDictionary,
  );

  let categoryImage = getFilterIcon(
    categoryIcons,
    props.useCaseCategory?.toLocaleLowerCase() || "",
  );

  return (
    <li className="flex flex-col items-start gap-m py-l transition-[width] focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light   dark:focus-visible:ring-border-dark">
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
          {!!formattedDescription.length && (
            <p
              className="body-l mt-3 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: formattedDescription }}
            />
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-m lg:flex-row lg:justify-between">
        {/* tags */}
        <div className="flex items-center gap-xs">
          {props.verified && <VerifiedBadge content={props.verifiedTooltip} />}
          {framework && (
            <button
              onLoad={() =>
                prefetchFilterChange(
                  REGISTRY_FILTER_TYPES.framework,
                  getAutomationFramworkTitle(props),
                )
              }
              onClick={() =>
                handleFilterChange(
                  REGISTRY_FILTER_TYPES.framework,
                  getAutomationFramworkTitle(props),
                )
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
                props.useCaseCategory &&
                handleFilterChange(
                  REGISTRY_FILTER_TYPES.useCase,
                  props.useCaseCategory,
                )
              }
              onLoad={() =>
                props.useCaseCategory &&
                prefetchFilterChange(
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

        {/* Attribution */}
        {props.author && (
          <button
            onClick={() =>
              handleFilterChange(REGISTRY_FILTER_TYPES.owner, props.author)
            }
            onLoad={() =>
              prefetchFilterChange(REGISTRY_FILTER_TYPES.owner, props.author)
            }
            className="rounded-sm focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light dark:focus-visible:ring-border-dark"
          >
            <div className="flex items-center gap-xxs">
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
