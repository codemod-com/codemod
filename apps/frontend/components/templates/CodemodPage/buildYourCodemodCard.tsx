import LinkButton from "@/components/shared/LinkButton";
import type { CodemodPagePayload } from "@/types";

export let getCodemodCard = (data: CodemodPagePayload | null) =>
  data?.globalLabels?.cta?.link && (
    <div className="relative flex w-full flex-col gap-s overflow-clip rounded-[8px] border border-border-light p-s dark:border-border-dark">
      {data?.globalLabels?.ctaTitle && (
        <div className="relative z-10 flex flex-col gap-[12px]">
          <p className="xs-heading">
            {data?.globalLabels?.ctaTitle || "Build custom codemods"}
          </p>
          {data?.globalLabels?.ctaDescription && (
            <p className="body-s">{data?.globalLabels?.ctaDescription}</p>
          )}
        </div>
      )}
      <img
        className="pointer-events-none absolute left-0 top-[60px] -z-10 w-full"
        alt="background illustration"
        src="/illustration/planet.svg"
      />
      <LinkButton href={data?.globalLabels?.cta?.link} intent="primary">
        {data?.globalLabels?.cta?.label || "Get started now"}
      </LinkButton>
    </div>
  );
