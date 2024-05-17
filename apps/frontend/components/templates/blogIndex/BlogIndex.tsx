import Section from "@/components/shared/Section";
import PageCta from "@/components/templates/ModularPage/PageCta";
import type { BlogIndexPayload } from "@/types";
import { cx } from "cva";
import ArticleList from "./ArticleList";
import BlogIndexHero from "./BlogIndexHero";

export type BlogIndexProps = {
  data: BlogIndexPayload | null;
  pathParam?: string;
};

export default function BlogIndex({ data, pathParam }: BlogIndexProps) {
  let { collectionTitle, cta, entries, emptyStateText } = data ?? {};
  let hasEntries = !!data?.entries?.length;

  return (
    <>
      <Section className="pt-[calc(var(--header-height)+2.5rem)] ">
        <div className="flex flex-col gap-2 lg:gap-16">
          <BlogIndexHero data={data} pathParam={pathParam} />
          <div className="collection">
            {collectionTitle && hasEntries ? (
              <h2 className="l-heading">{collectionTitle}</h2>
            ) : null}
            {hasEntries ? (
              <ArticleList initial={data} pathParam={pathParam} />
            ) : null}
          </div>
        </div>
      </Section>
      <div className="relative">
        {cta && <PageCta {...cta} />}
        <BlogGradientBlob />
      </div>
    </>
  );
}

function BlogGradientBlob() {
  return (
    <div
      className={cx(
        "pointer-events-none absolute ",
        "gradient-planet -bottom-[15%] -right-40 z-0 h-[390px] w-[390px] shrink-0 rotate-[151.909deg]  rounded-[390.038px] opacity-30 blur-[30px]  sm:-right-[20%] sm:h-[550px] sm:w-[620px]  lg:-bottom-28 lg:h-[662px] lg:w-[662px] lg:blur-[90px] dark:opacity-10",
      )}
    />
  );
}
