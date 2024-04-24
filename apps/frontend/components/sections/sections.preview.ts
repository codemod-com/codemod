import SectionRegistry from "./sectionComponents/SectionRegistry/SectionsRegistry.preview";
import { commonSections } from "./sections.common";

export const sections: Record<string, React.ComponentType<any>> = {
  ...commonSections,
  "section.registry": SectionRegistry,
};
