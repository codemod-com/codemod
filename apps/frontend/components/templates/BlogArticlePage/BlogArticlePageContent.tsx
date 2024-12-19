import NavigationLink from "@/components/global/Navigation/NavigationLink";
import CtaCard from "@/components/shared/CtaCard";
import Icon, { TechLogo } from "@/components/shared/Icon";
import { RichText } from "@/components/shared/RichText";
import { SanityImage } from "@/components/shared/SanityImage";
import { SanityLink } from "@/components/shared/SanityLink";
import Section from "@/components/shared/Section";
import TableOfContents from "@/components/shared/TableOfContents";
import { CUSTOMER_STORY_TAG } from "@/constants";

import type {
  BlogArticlePayload,
  BlogArticleSidebar,
  CustomerStorySidebar,
} from "@/types";
import getBlocksToc from "@/utils/getBlocksToc";
import { cx } from "cva";

export default function BlogArticlePageContent(props: BlogArticlePayload) {
  const isCustomerStory = props._type === "blog.customerStory";
  const toc = getBlocksToc(props.body);

  const customerStorySidebar = props.sidebar as CustomerStorySidebar;
  const articleSidebar = props.sidebar as BlogArticleSidebar;

  const ctaCardProps = {
    title: customerStorySidebar?.articleCta?.title || "",
    description: customerStorySidebar?.articleCta?.subtitle || "",
    ctaText: customerStorySidebar?.articleCta?.cta?.label || "",
    href: customerStorySidebar?.articleCta?.cta?.link || "",
  };

  return (
    <Section>
      <div className="relative flex w-full flex-col items-start justify-center gap-l pt-[calc(var(--header-height))] lg:gap-2xl">
        <div
          className={cx(
            "relative border py-8 lg:py-24 px-6 lg:px-32 border-black/10 dark:border-white/10 w-full",
          )}
        >
          {/* Header */}
          <div className="flex w-full flex-col items-center gap-m">
            {/* Link back to /blog */}
            <div className="flex items-center gap-s">
              <NavigationLink
                href="/blog"
                className="body-s-medium flex items-center gap-xs font-medium text-secondary-light dark:text-secondary-dark"
              >
                <span>{props.globalLabels?.backToIndex || "Back to blog"}</span>
              </NavigationLink>
              <Icon name="chevron-right" />
              {isCustomerStory ? (
                <SanityLink
                  link={{
                    href: `/blog/tag/${CUSTOMER_STORY_TAG.value}`,
                  }}
                >
                  <span className="body-s-medium flex items-center gap-xs font-medium text-secondary-light dark:text-white">
                    {CUSTOMER_STORY_TAG.label}
                  </span>
                </SanityLink>
              ) : (
                props?.tags?.map((tag) => (
                  <SanityLink
                    key={tag?.slug?.current}
                    link={{
                      href: `/blog/tag/${tag?.slug?.current}`,
                    }}
                  >
                    <span className="body-s-medium flex items-center gap-xs font-medium text-secondary-light dark:text-white">
                      {tag?.title}
                    </span>
                  </SanityLink>
                ))
              )}
            </div>

            <h1 className="l-heading lg:xl-heading text-center">
              {props?.title}
            </h1>
            <ArticleAuthors authors={props.authors} />

            <div className="w-full lg:hidden">
              <div className="grid w-full grid-cols-1 gap-l sm:grid-cols-2 md:grid-cols-3">
                {isCustomerStory && customerStorySidebar?.features && (
                  <>
                    <Features features={customerStorySidebar?.features} />
                  </>
                )}

                {isCustomerStory && customerStorySidebar?.stats && (
                  <>
                    <Stats stats={customerStorySidebar?.stats} />
                  </>
                )}
              </div>
              {isCustomerStory
                ? null
                : articleSidebar?.showToc &&
                  toc.length > 0 && (
                    <div className="hidden">
                      <TableOfContents
                        variant="sidebar"
                        outlines={toc}
                        title={"On this page"}
                      />
                      <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#0b151e] to-transparent dark:via-emphasis-dark" />
                    </div>
                  )}
            </div>
          </div>

          <div className="relative flex w-full mt-m z-10">
            {/* Body */}
            <div className="body-l relative max-w-full flex-1 lg:max-w-xl xl:max-w-2xl mx-auto [&_p]:pb-8">
              <div className="flex flex-wrap flex-row justify-between mb-8 lg:mb-16">
                {typeof props.readTime === "number" && (
                  <span className="inline-flex gap-2 items-center body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
                    <Icon name="countdown-timer" />
                    {Number(props.readTime)} min read
                  </span>
                )}

                {props.publishedAt && (
                  <time className="inline-flex gap-2 items-center body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
                    <Icon name="calendar" />
                    {new Date(props.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                )}
              </div>
              {props?.body && (
                <RichText
                  value={props?.body}
                  usage="textPage"
                  fieldName="body"
                />
              )}
            </div>
          </div>

          {/* Footer  */}
          {isCustomerStory && customerStorySidebar?.articleCta && (
            <div className="relative mt-2xl grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:hidden">
              <CtaCard {...ctaCardProps} />
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#0b151e] to-transparent sm:hidden dark:via-emphasis-dark" />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

const Stats = (props: { stats: CustomerStorySidebar["stats"] }) => {
  return (
    <div className="space-y-2">
      {props?.stats?.map((stat, index) => (
        <div key={index} className="mb-1">
          <div className="m-heading  mb-1 flex items-center gap-4">
            <span className="">{stat?.from}</span>
            {stat?.useFromTo && <Icon name="arrow-right" />}
            {stat?.useFromTo && <span className="">{stat?.to}</span>}
          </div>
          {stat?.subtitle && (
            <p className="body-s-medium max-w-52 font-medium text-secondary-light dark:text-secondary-dark">
              {stat?.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
const Features = (props: { features: CustomerStorySidebar["features"] }) => {
  return (
    <div className="space-y-2">
      <h4 className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
        Features Highlighted
      </h4>
      {props?.features?.map((feature, index) => (
        <SanityLink
          key={index}
          link={{
            href: feature?.url,
            _type: "link",
          }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-xs">
            <TechLogo className="h-5 w-5" name={feature?.logo} />
            <span className="body-s-medium font-medium">{feature?.title}</span>
          </div>
        </SanityLink>
      ))}
    </div>
  );
};

const ArticleAuthors = (props: { authors: BlogArticlePayload["authors"] }) => {
  return (
    <ul className="flex flex-row items-center gap-4">
      {props?.authors?.map((author, index) => (
        <li key={author?._key ?? String(index)}>
          <SanityLink
            link={{
              href: author?.socialUrl,
              _type: "link",
            }}
            className="flex"
          >
            {author?.image && (
              <SanityImage
                maxWidth={100}
                alt={author?.name}
                image={author?.image}
                elProps={{
                  className: cx(
                    "block rounded-full relative object-cover w-5 h-5 mr-2",
                  ),
                }}
              />
            )}
            <div className="flex flex-row gap-2">
              <span className="body-s-medium font-medium">{author?.name}</span>
              {author?.details && (
                <span className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
                  {author?.details}
                </span>
              )}
            </div>
          </SanityLink>
        </li>
      ))}
    </ul>
  );
};
