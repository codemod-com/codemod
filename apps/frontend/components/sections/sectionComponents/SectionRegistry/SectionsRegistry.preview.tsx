"use client";
import Section from "@/components/shared/Section";
import RegistrySectionInner from "@/components/templates/Registry/RegistrySectionInner";
import { getInitialAutomations } from "@/components/templates/Registry/helpers";
import type { SectionRegistryProps } from "@/types/section.types";
import { vercelStegaCleanAll } from "@sanity/client/stega";
import useSWR from "swr";

export default function SectionRegistry(props: SectionRegistryProps) {
  const slugs = vercelStegaCleanAll(props.initialAutomationSlugs);
  const { data: automations } = useSWR("RegistrySection", () =>
    getInitialAutomations(slugs),
  );

  return (
    <Section className="w-full py-20">
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          {props.title && (
            <h2 className="l-heading font-bold">{props.title}</h2>
          )}
          {props.subtitle && (
            <p className="body-l max-w-2xl">{props.subtitle}</p>
          )}
        </div>
        <RegistrySectionInner {...props} initialAutomations={automations} />
      </div>
    </Section>
  );
}
