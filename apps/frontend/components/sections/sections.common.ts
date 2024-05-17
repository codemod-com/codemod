import Features from "./sectionComponents/Features";
import SectionFullWidthMedia from "./sectionComponents/SectionFullWidthMedia";
import Testimonials from "./sectionComponents/Testimonials";

export let commonSections: Record<string, React.ComponentType<any>> = {
  "section.testimonials": Testimonials,
  "section.features": Features,
  "section.fullWidthMedia": SectionFullWidthMedia,
};
