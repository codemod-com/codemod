import type { SectionInRenderer, SectionsBody } from "@/types";
import type { AutomationResponse } from "@/types/object.types";
import { getDeepLinkId } from "@/utils/ids";

export let SectionsRenderer = ({
  sections,
  fieldName,
  componentsMap,
  initialAutomations,
}: {
  sections?: SectionInRenderer[];
  initialAutomations?: AutomationResponse[];
  fieldName: string;
  // @ts-ignore
  componentsMap: Record<string, React.ComponentType<any>>;
}) => {
  if (!sections?.length) {
    return null;
  }

  return (<>
    {sections.map((section, index) => {
      if (!section) {
        return null;
      }

      let Component = componentsMap[section._type];

      if (!Component) {
        return null;
      }
      let extraProps =
        section._type === "section.registry" ? { initialAutomations } : {};
      return (
        <Component
          key={section._key}
          {...section}
          {...extraProps}
          _sectionIndex={index}
          _sections={sections}
          rootHtmlAttributes={{
            "data-section": section._type,
            id: getDeepLinkId({ fieldName, sectionKey: section._key }),
          }}
        />
      );
    })}
  </>);
};
