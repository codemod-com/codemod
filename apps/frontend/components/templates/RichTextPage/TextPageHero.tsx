import Section from "@/components/shared/Section";
import type { TextPageHeroProps } from "@/types/object.types";
import { cx } from "cva";

export default function TextPageHero(props: TextPageHeroProps) {
  return (
    <Section className="relative z-0 w-full max-w-full overflow-x-clip overflow-y-clip pb-20 pt-[calc(var(--header-height)+5rem)] lg:overflow-x-visible">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full">
        <div className="pointer-events-none relative h-full w-full">
          <GradientBlob style="planet" />
          <GradientBlob style="ellipse" />
        </div>
      </div>
      <div className="relative z-20 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center  gap-4 lg:gap-6">
          <h1 className="xl-heading max-w-96 font-bold lg:max-w-2xl">
            {props.title}
          </h1>
          {props.lastUpdatedText && (
            <p className="body-l mb-10 max-w-lg lg:max-w-2xl">
              {props.lastUpdatedText}
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

function GradientBlob({ style = "ellipse" }: { style: "ellipse" | "planet" }) {
  return (
    <div
      className={cx("pointer-events-none absolute ", {
        "gradient-planet lg:-right[10%] -right-[41%] -top-[20%] -z-10 h-[390px] w-[390px] shrink-0 rotate-[151.909deg]  rounded-[390.038px] opacity-30 blur-[30px]  sm:-right-[20%] sm:h-[550px] sm:w-[620px] lg:-top-[40%] lg:h-[662px] lg:w-[662px] lg:blur-[90px] dark:opacity-10":
          style === "planet",
        "gradient-ellipse right-[80%] top-[46%] z-10  h-[481px] w-[402px] shrink-0 rotate-90 rounded-[481px] opacity-40  blur-[45px] lg:-top-[50%] lg:h-[856px] lg:w-[716px] lg:blur-[160px] dark:opacity-15":
          style === "ellipse",
      })}
    ></div>
  );
}
