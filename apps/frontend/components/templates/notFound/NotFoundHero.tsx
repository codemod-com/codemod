import type { NotFoundPayload } from "@/types";

import Section from "@/components/shared/Section";

import LinkButton from "@/components/shared/LinkButton";
import { cx } from "cva";

export function NotFoundHero({ data }: { data?: NotFoundPayload }) {
  return (
    <Section className="relative z-10 w-full max-w-full overflow-x-clip overflow-y-clip pb-[120px] pt-[calc(var(--header-height)+5rem)] lg:overflow-x-visible  lg:pb-[150px] lg:pt-[calc(var(--header-height)+9.4rem)]">
      <div className="absolute bottom-[-0.5px] left-0 z-10 hidden h-px w-full bg-gradient-to-r from-transparent via-tertiary-light lg:block dark:via-white" />
      <div className="absolute bottom-0 left-0 h-full w-full bg-white  dark:bg-background-dark" />
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full">
        <div className="pointer-events-none relative h-full w-full">
          <GradientBlob style="planet" />
          <GradientBlob style="ellipse" />
        </div>
      </div>
      <div className="relative z-20 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center  gap-4 lg:gap-6">
          {data?.title && (
            <h1 className="xl-heading max-w-96 font-bold lg:max-w-2xl">
              {data.title}
            </h1>
          )}
          {data?.description && (
            <p className="body-l max-w-lg lg:max-w-2xl">{data.description}</p>
          )}
          <div className="mt-3 flex justify-between gap-4">
            {data?.heroCta && (
              <LinkButton
                {...{
                  intent: "primary" as "primary" | "secondary",
                  arrow: true,
                  href: data.heroCta.link,
                }}
              >
                {data.heroCta?.label}
              </LinkButton>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

function GradientBlob({ style = "ellipse" }: { style: "ellipse" | "planet" }) {
  return (
    <div
      className={cx("pointer-events-none absolute ", {
        "gradient-planet lg:-right[10%] -right-[41%] -top-[20%] -z-10 h-[390px] w-[390px] shrink-0 rotate-[151.909deg]  rounded-[390.038px] opacity-30 blur-[30px]  sm:-right-[20%] sm:h-[550px] sm:w-[620px] lg:-top-[20%] lg:h-[662px] lg:w-[662px] lg:blur-[90px] dark:opacity-10":
          style === "planet",
        "gradient-ellipse right-[80%] top-[46%] z-10  h-[481px] w-[402px] shrink-0 rotate-90 rounded-[481px] opacity-40  blur-[45px] lg:-top-[20%] lg:h-[856px] lg:w-[716px] lg:blur-[160px] dark:opacity-15":
          style === "ellipse",
      })}
    ></div>
  );
}
