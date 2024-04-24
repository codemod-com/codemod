import NavigationLink from "@/components/global/Navigation/NavigationLink";
import CtaCard from "@/components/shared/CtaCard";
import Icon, { TechLogo } from "@/components/shared/Icon";
import RelatedLinks from "@/components/shared/RelatedLinks";
import { RichText } from "@/components/shared/RichText";
import { SanityImage } from "@/components/shared/SanityImage";
import { SanityLink } from "@/components/shared/SanityLink";
import Section from "@/components/shared/Section";
import TableOfContents from "@/components/shared/TableOfContents";
import Tag from "@/components/shared/Tag";
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
      <div className="relative flex w-full flex-col items-start justify-center gap-l pb-xl pt-[calc(var(--header-height)+24px)] lg:gap-2xl lg:pb-[80px]">
        {/* Link back to /blog */}
        <div className="w-full">
          <NavigationLink
            href="/blog"
            className="body-s-medium flex items-center gap-xs font-medium text-secondary-light dark:text-secondary-dark"
          >
            <Icon name="arrow-left" />
            <span>{props.globalLabels?.backToIndex || "Back to blog"}</span>
          </NavigationLink>
        </div>

        {/* Header */}
        <div className="flex w-full flex-col items-start gap-l lg:gap-s">
          <div className="flex items-center gap-m">
            {isCustomerStory ? (
              <SanityLink
                link={{
                  href: `/blog/tag/${CUSTOMER_STORY_TAG.value}`,
                }}
              >
                <Tag>{CUSTOMER_STORY_TAG.label}</Tag>
              </SanityLink>
            ) : (
              props?.tags?.map((tag) => (
                <SanityLink
                  key={tag?.slug?.current}
                  link={{
                    href: `/blog/tag/${tag?.slug?.current}`,
                  }}
                >
                  <Tag>{tag?.title}</Tag>
                </SanityLink>
              ))
            )}
          </div>
          <h1 className="xl-heading lg:w-2/3">{props?.title}</h1>
          <div className="flex">
            {props.publishedAt && (
              <time className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
                {new Date(props.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            <span className="body-s-medium px-1 font-medium text-secondary-light dark:text-secondary-dark">
              ·
            </span>
            {typeof props.readTime === "number" && (
              <span className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
                {Number(props.readTime)} min read
              </span>
            )}
          </div>

          <div className="w-full lg:hidden">
            <div className="grid w-full grid-cols-1 gap-l sm:grid-cols-2 md:grid-cols-3">
              {props.authors && (
                <>
                  <div className="col-span-full md:col-span-1">
                    <ArticleAuthors authors={props.authors} />
                  </div>
                </>
              )}
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
            <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#0b151e] to-transparent dark:via-emphasis-dark" />
            {isCustomerStory
              ? null
              : articleSidebar?.showToc &&
                toc.length > 0 && (
                  <>
                    <TableOfContents
                      variant="sidebar"
                      outlines={toc}
                      title={"On this page"}
                    />
                    <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#0b151e] to-transparent dark:via-emphasis-dark" />
                  </>
                )}
          </div>
        </div>

        <div className="relative flex w-full">
          {/* Body */}
          <div className="body-m relative max-w-full flex-1 lg:max-w-xl lg:pr-[68px]  xl:max-w-3xl">
            {props?.body && (
              <>
                <RichText
                  value={props?.body}
                  usage="textPage"
                  fieldName="body"
                />
                <div className="absolute right-0 top-0 hidden h-full w-[1px] bg-gradient-to-b from-transparent via-[#0b151e39] via-10% to-transparent to-95%  lg:flex dark:via-[#ffffff33]" />
              </>
            )}
          </div>
          {/* Sidebar */}
          <aside className="sticky top-8 hidden h-fit w-1/3 px-s pl-[52px] lg:flex">
            <div className="flex w-full flex-col">
              {props.authors && (
                <>
                  <ArticleAuthors authors={props.authors} />
                  <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#0b151e] to-transparent dark:via-emphasis-dark" />
                </>
              )}

              {isCustomerStory && customerStorySidebar?.features && (
                <>
                  <Features features={customerStorySidebar?.features} />
                  <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#0b151e] to-transparent dark:via-emphasis-dark" />
                </>
              )}

              {isCustomerStory && customerStorySidebar?.stats && (
                <>
                  <Stats stats={customerStorySidebar?.stats} />
                  <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#0b151e] to-transparent dark:via-emphasis-dark" />
                </>
              )}

              {isCustomerStory
                ? null
                : articleSidebar?.showToc &&
                  toc.length > 0 && (
                    <>
                      <TableOfContents
                        variant="sidebar"
                        outlines={toc}
                        title={"On this page"}
                      />
                      <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#0b151e] to-transparent dark:via-emphasis-dark" />
                    </>
                  )}

              {isCustomerStory && customerStorySidebar?.articleCta && (
                <div className="">
                  <CtaCard {...ctaCardProps} />
                  <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-[#0b151e] to-transparent dark:via-emphasis-dark" />
                </div>
              )}

              {props?.relatedArticles ? (
                <RelatedLinks
                  textStyle="medium"
                  className=""
                  title={
                    props.globalLabels?.relatedArticles || "Related articles"
                  }
                  links={props?.relatedArticles.map((article) => ({
                    title: article?.title || "",
                    href: article?.pathname?.split("/")[2] || "",
                  }))}
                />
              ) : null}
            </div>
          </aside>
        </div>

        {/* Footer  */}
        <div className="relative mt-2xl grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:hidden">
          {props?.relatedArticles ? (
            <>
              <RelatedLinks
                textStyle="medium"
                className="lg:hidden"
                title={
                  props.globalLabels?.relatedArticles || "Related articles"
                }
                links={props?.relatedArticles.map((article) => ({
                  title: article?.title || "",
                  href: article?.pathname?.split("/")[2] || "",
                }))}
              />
            </>
          ) : null}

          {isCustomerStory && customerStorySidebar?.articleCta && (
            <div className="">
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
    <div className="relative">
      <span className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
        Posted By
      </span>
      <ul className="ml-0 mt-4 flex flex-col gap-4">
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
                      "block rounded-md relative object-cover w-10 h-10  ",
                      {
                        "border-l border-white": index !== 0,
                      },
                    ),
                  }}
                />
              )}
              <div className="ml-2 flex flex-col">
                <span className="body-s-medium font-medium">
                  {author?.name}
                </span>
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
    </div>
  );
};
