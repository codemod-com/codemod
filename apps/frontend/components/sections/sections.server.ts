import SectionRegistry from "./sectionComponents/SectionRegistry/SectionsRegistry.server";
import { commonSections } from "./sections.common";

export let sections: Record<string, React.ComponentType<any>> = {
  ...commonSections,
  "section.registry": SectionRegistry,
};
