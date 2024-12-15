import { useTranslation } from "react-i18next";
import Markdown from "@/components/global/ReactMarkdown";
import Icon from "@/components/shared/Icon";
import { SanityImage } from "@/components/shared/SanityImage";
import { REGISTRY_FILTER_TYPES } from "@/constants";
import { useRegistryFilters } from "@/hooks/useRegistryFilters";
import type { RegistryCardData } from "@/types/object.types";
import { capitalize, unslugify } from "@/utils/strings";
import { vercelStegaSplit } from "@vercel/stega";
import { prop, uniqBy } from "ramda";
import { SanityLink } from "../../shared/SanityLink";
import Tag from "../../shared/Tag";
import { AuthorSection } from "../CodemodPage/AuthorSection";
import VerifiedBadge from "./VerifiedBadge";
import {
  getAutomationFrameworkTitles,
  getAutomationPathname,
  getDescriptionShortText,
  getFilterIcon,
  getFilterSection,
} from "./helpers";

export default function RegistryCard(props: RegistryCardData) {
const { t } = useTranslation("../../components/templates/Registry");

  const { handleFilterChange, prefetchFilterChange } = useRegistryFilters();

  const { cleaned: author } = vercelStegaSplit(`${props.author}`);

  const _author = {
    title: props.author === "Codemod" ? "codemod" : props.author,
    username: props.author === "Codemod" ? "codemod-com" : props.author,
  };
  const authorHref = `https://github.com/${_author.username}`;

  const formattedDescription = getDescriptionShortText(
    props.shortDescription || "",
  );

  const frameworkIcons = getFilterSection(
    REGISTRY_FILTER_TYPES.framework,
    props.filterIconDictionary,
  );

  const frameworks = getAutomationFrameworkTitles(props).map((framework) => ({
    name: framework,
    image: getFilterIcon(frameworkIcons, framework),
  }));

  const authorIcons = getFilterSection("author", props.filterIconDictionary);
  const authorImage = getFilterIcon(authorIcons, author);

  const categoryIcons = getFilterSection(
    "category",
    props.filterIconDictionary,
  );

  const categoryImage = getFilterIcon(
    categoryIcons,
    props.useCaseCategory?.toLocaleLowerCase() || "",
  );

  return (
    <li className="flex flex-col items-start gap-m py-l transition-[width] focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light   dark:focus-visible:ring-border-dark">
      <div className="flex flex-col items-start">
        <div>
          {props.featured && <span className="tag">{t('featured')}</span>}
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
          {formattedDescription ? (
            <div className="mt-4 flex-col gap-4">
              <Markdown>{formattedDescription}</Markdown>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex w-full flex-col gap-m lg:flex-row lg:justify-between lg:items-center">
        {/* tags */}
        <div className="flex items-center gap-xs">
          {props.verified && <VerifiedBadge content={props.verifiedTooltip} />}
          {uniqBy(prop("name"), frameworks).map(
            ({ name: framework, image: frameworkImage }) => (
              <button
                key={framework}
                onLoad={() =>
                  prefetchFilterChange(
                    REGISTRY_FILTER_TYPES.framework,
                    framework,
                  )
                }
                onClick={() =>
                  handleFilterChange(REGISTRY_FILTER_TYPES.framework, framework)
                }
                type="button"
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
            ),
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
          <AuthorSection
            author={_author.title}
            authorImage={authorImage}
            href={authorHref}
          />
        )}
      </div>
    </li>
  );
}
