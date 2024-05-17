import GradientBlob from "@/components/shared/GradientBlob";
import GradientBorderBox from "@/components/shared/GradientBorderBox";
import LinkButton from "@/components/shared/LinkButton";
import { RichText } from "@/components/shared/RichText";
import PageCta from "@/components/templates/ModularPage/PageCta";

import type { CareersPagePayload } from "@/types";
import { vercelStegaSplit } from "@vercel/stega";

export interface CareersPageProps {
  data: CareersPagePayload;
}

export default function CareersPageUI({ data }: CareersPageProps) {
  return (
    <div className="w-full">
      <div className="relative overflow-x-clip overflow-y-clip px-xl pb-20 pt-[calc(var(--header-height)+5rem)] lg:overflow-x-visible lg:px-[80px]">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full">
          <div className="pointer-events-none relative h-full w-full">
            <GradientBlob style="planet" />
            <GradientBlob style="ellipse" />
          </div>
        </div>
        <div className="relative z-20 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center  gap-4 lg:gap-6">
            <h1 className="xl-heading max-w-96 font-bold lg:max-w-2xl">
              {data?.title}
            </h1>
            <div className="body-l mb-10 max-w-lg lg:max-w-2xl">
              <RichText value={data?.subtitle} />
            </div>
          </div>
        </div>
      </div>

      {!data?.jobs ? <JobsListEmptyState /> : <JobsList jobs={data?.jobs} />}

      {data?.cta && <PageCta {...data?.cta} />}
    </div>
  );
}

function JobsList({ jobs }: { jobs: CareersPagePayload["jobs"] }) {
  return (
    <div className="w-full px-m py-2xl lg:px-[80px] lg:pb-[80px] lg:pt-32">
      {jobs.map((job, index) => (
        <Job key={job?.title} job={job} index={index} count={jobs?.length} />
      ))}
    </div>
  );
}

function JobsListEmptyState() {
  return (
    <div className="mt-[80px] flex w-full items-center justify-center p-m lg:p-[80px]">
      <h3 className="xs-heading">There are no open position at the moment</h3>
    </div>
  );
}

function Job({
  job,
  index,
  count,
}: {
  job: CareersPagePayload["jobs"][0];
  index: number;
  count: number;
}) {
  let getSides = () => {
    return {
      right: false,
      left: false,
      bottom: index !== count - 1,
      top: false,
    };
  };

  let { cleaned: href } = vercelStegaSplit(job?.pathname?.current || "");

  return (
    <GradientBorderBox
      className="flex w-full max-w-none flex-col gap-xs py-l first:pt-0 last:pb-0 lg:flex-row lg:justify-between lg:py-m"
      sides={getSides()}
      dots={{
        tl: false,
        tr: false,
        bl: false,
        br: false,
      }}
    >
      <h2 className="s-heading">{job?.title}</h2>
      <div className="flex flex-col items-start gap-s lg:flex-row lg:items-center lg:gap-2xl">
        <div className="flex items-center gap-s lg:gap-2xl">
          <span className="body-s-medium block font-medium">
            {job?.location}
          </span>
          <span className="body-s-medium block rounded-[4px] border-[1px] border-border-light px-xs py-xxs font-medium dark:border-border-dark">
            {job?.department}
          </span>
        </div>
        <LinkButton intent="primary" href={href} arrow>
          Apply
        </LinkButton>
      </div>
    </GradientBorderBox>
  );
}
