import Markdown from "@/components/global/ReactMarkdown";
import Icon from "@/components/shared/Icon";
import { SanityImage } from "@/components/shared/SanityImage";
import type { RegistryCardData } from "@/types/object.types";
import { capitalize, unslugify } from "@/utils/strings";
import { vercelStegaSplit } from "@vercel/stega";
import { SanityLink } from "../../shared/SanityLink";
import Tag from "../../shared/Tag";
import VerifiedBadge from "./VerifiedBadge";
import {
  getAutomationPathname,
  getDescriptionShortText,
  getFilterIcon,
  getFilterSection,
} from "./helpers";

export default function RegistryCard(props: RegistryCardData) {
  const { cleaned: author } = vercelStegaSplit(`${props.author}`);

  const _author = {
    title: props.author === "Codemod" ? "codemod" : props.author,
    username: props.author === "Codemod" ? "codemod-com" : props.author,
  };
  const authorHref = `https://github.com/${_author.username}`;

  const formattedDescription = getDescriptionShortText(
    props.shortDescription || "",
  );

  const authorIcons = getFilterSection("author", props.filterIconDictionary);
  const authorImage = getFilterIcon(authorIcons, author);

  const latestVersion = props.versions?.[props.versions.length - 1]?.version;
  const formattedDate = props.updatedAt
    ? new Date(props.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : undefined;

  return (
    <li className="flex flex-col gap-m py-l transition-[width] focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light dark:focus-visible:ring-border-dark">
      {/* Header: avatar + title + optional version */}
      <div className="flex w-full items-start gap-s">
        {/* Avatar */}
        <div className="mt-1 h-8 w-8 overflow-hidden rounded-full border border-border-light dark:border-border-dark">
          {authorImage?.image?.light ? (
            <>
              <SanityImage
                maxWidth={32}
                image={authorImage.image.light}
                alt={authorImage.image.light.alt}
                elProps={{
                  width: 32,
                  height: 32,
                  className: "h-8 w-8 dark:hidden",
                }}
              />
              {authorImage.image.dark && (
                <SanityImage
                  maxWidth={32}
                  image={authorImage.image.dark}
                  alt={authorImage.image.dark.alt}
                  elProps={{
                    width: 32,
                    height: 32,
                    className: "hidden h-8 w-8 dark:block",
                  }}
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon name="user" className="h-4 w-4 opacity-60" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-xs">
            <SanityLink
              link={{ _type: "link", href: getAutomationPathname(props.slug) }}
            >
              <h3 className="xs-heading hover:underline truncate">
                {unslugify(props.name || "Untitled Automation")}
              </h3>
            </SanityLink>
            {latestVersion && (
              <Tag intent="static">
                <span className="font-mono">v{latestVersion}</span>
              </Tag>
            )}
            {props.verified && (
              <VerifiedBadge content={props.verifiedTooltip} />
            )}
          </div>
          {formattedDescription ? (
            <div className="mt-3 flex-col gap-4">
              <Markdown>{formattedDescription}</Markdown>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tags */}
      {!!props.tags?.length && (
        <div className="flex flex-wrap items-center gap-1">
          {props.tags.slice(0, 2).map((tag) => (
            <Tag key={tag} intent="default">
              <span># {tag}</span>
            </Tag>
          ))}
          {props.tags.length > 2 && (
            <Tag intent="static">
              <span>+{props.tags.length - 2}</span>
            </Tag>
          )}
        </div>
      )}

      {/* Footer: author + metrics + date */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3 text-secondary-light/80 dark:text-secondary-dark/80">
          {props.author && (
            <div className="flex items-center gap-1">
              <Icon name="user" className="h-4 w-4" />
              <a
                href={authorHref}
                target="_blank"
                rel="noreferrer"
                className="body-s-medium font-mono hover:opacity-70"
              >
                @{_author.title}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Icon name="star" className="h-4 w-4" />
            <span className="body-s">{props.openedPrs ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="file" className="h-4 w-4" />
            <span className="body-s">{props.amountOfUses ?? 0}</span>
          </div>
        </div>
        {formattedDate && (
          <div className="flex items-center gap-1 text-secondary-light/80 dark:text-secondary-dark/80">
            <Icon name="calendar" className="h-4 w-4" />
            <span className="body-s">{formattedDate}</span>
          </div>
        )}
      </div>
    </li>
  );
}
