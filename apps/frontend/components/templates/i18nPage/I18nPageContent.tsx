import GradientBlob from "@/components/shared/GradientBlob";
import LinkButton from "@/components/shared/LinkButton";
import BookOpenLinkButton from "@/components/shared/animated-icons/BookOpenLinkButton";
import CobeSection from "./Cobe";
import type { I18NPageProps } from "./Page";
import DemoSection from "./Preview/DemoSection";
import ShiningLines from "./Preview/ShinningLines";

export default function I18NPageSections({ data }: I18NPageProps) {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-x-clip px-xl py-[80px] pt-[calc(var(--header-height)+5rem)] lg:overflow-x-visible lg:px-[80px]">
        <div className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-full">
          <div className="pointer-events-none relative h-full w-full">
            <GradientBlob style="planet" />
            <GradientBlob style="ellipse" />
          </div>
        </div>

        <ShiningLines numberOfLines={6} />

        <div className="relative z-20 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="xl-heading max-w-96 font-bold lg:max-w-[800px]">
              {data?.hero?.title}
            </h1>
            {data?.hero?.subtitle && (
              <p className="body-l mb-10 mt-4 max-w-lg lg:mt-6 lg:max-w-2xl">
                {data?.hero?.subtitle}
              </p>
            )}
          </div>
          <div className="flex justify-between gap-4">
            {data.hero?.ctas?.[0] && (
              <LinkButton
                key={data.hero?.ctas?.[0]._key}
                intent="primary"
                arrow
                hideExternalIcon
                href={data.hero?.ctas?.[0].link}
              >
                {data.hero?.ctas?.[0].label}
              </LinkButton>
            )}
            {data.hero?.ctas?.[1] && (
              <>
                <BookOpenLinkButton
                  intent="secondary"
                  href={data.hero?.ctas?.[1].link}
                >
                  {data.hero?.ctas?.[1].label}
                </BookOpenLinkButton>
              </>
            )}
          </div>
        </div>
      </div>

      <DemoSection />
      <CobeSection />
    </>
  );
}
