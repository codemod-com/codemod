import Section from "@/components/shared/Section";
import RegistrySectionInner from "@/components/templates/Registry/RegistrySectionInner";
import { getInitialAutomations } from "@/components/templates/Registry/helpers";
import { loadRegistryAPIData } from "@/data/codemod/loaders";
import type { SectionRegistryProps } from "@/types/section.types";

export default async function SectionRegistry(props: SectionRegistryProps) {
  let automations = await getInitialAutomations(props.initialAutomationSlugs);

  let data = await loadRegistryAPIData({
    pageNumber: 1,
    searchParams: new URLSearchParams(),
    entriesPerPage: 1,
  });

  let filter = data?.filters?.find((f) => f.id === props.automationFilter);

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

        <RegistrySectionInner
          {...props}
          initialAutomations={automations}
          filter={filter}
        />
      </div>
    </Section>
  );
}
