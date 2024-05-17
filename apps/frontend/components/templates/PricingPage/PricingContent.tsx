import GradientBlob from "@/components/shared/GradientBlob";
import Icon from "@/components/shared/Icon";
import LinkButton from "@/components/shared/LinkButton";
import { RichText } from "@/components/shared/RichText";
import Section from "@/components/shared/Section";
import type { Plan } from "@/types";
import { vercelStegaSplit } from "@vercel/stega";
import React from "react";
import type { PricingPageProps } from "./Page";

export default function PricingSection({ data }: PricingPageProps) {
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
              {data.hero.title}
            </h1>
            <p className="body-l mb-10 max-w-lg lg:max-w-2xl">
              {data.hero.subtitle}
            </p>
          </div>
        </div>
      </div>
      <Section className="flex w-full flex-col gap-s bg-primary-dark px-m py-xl lg:flex-row lg:gap-m lg:px-0 lg:py-[80px] dark:bg-primary-light">
        {data?.plans.map((plan, index) => (
          <PricePlanCard key={index} {...plan} />
        ))}
      </Section>
    </div>
  );
}

function PricePlanCard(props: Plan) {
  let { cleaned: title } = vercelStegaSplit(props.title || "");
  return (
    <div className="flex min-h-[500px] flex-1 flex-col rounded-[8px] border border-border-light p-l lg:min-h-[600px] dark:border-border-dark">
      <div className="mb-s flex items-center gap-s">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emphasis-light p-xs dark:bg-emphasis-dark">
          {props.icon && <Icon name={props.icon} className="h-5 w-5" />}
        </div>
        <h3 className="xs-heading">{title}</h3>
        {props?.priceNotes ? (
          <span className="body-s ml-auto text-secondary-light dark:text-secondary-dark">
            {props.priceNotes}
          </span>
        ) : null}
      </div>

      <div className="body-s-medium mb-m font-medium">
        {props.planDescription && <RichText value={props.planDescription} />}
      </div>

      <h4 className="l-heading mb-xs">{props.price}</h4>

      <div className="body-l flex gap-xs">
        {props.targetPlanDescription && (
          <RichText value={props.targetPlanDescription} />
        )}
        {props.title === "Developer" ? (
          <div className="body-s-medium h-fit whitespace-nowrap rounded-[4px] bg-gradient-to-br from-accent from-[32%] to-[#EEFDC2] to-[87%] px-xs py-xxs font-medium text-primary-light">
            Free forever
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-s py-xl">
        <div className="body-l-medium flex items-center gap-s font-medium">
          <Icon name="check" className="invisible h-4 w-4 shrink-0" />
          <span>{props.featuresTitle}</span>
        </div>
        <ul className="ml-0 flex flex-col gap-s">
          {props.features?.map((feature, index) => (
            <li key={index} className="flex items-center gap-s">
              <Icon name="check" className="h-4 w-4 shrink-0" />
              <span className="body-s">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <LinkButton
        arrow
        intent="primary"
        href={props.cta?.link}
        className="mt-auto"
        hideExternalIcon
      >
        {props.cta?.label}
      </LinkButton>
    </div>
  );
}
