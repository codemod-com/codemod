import { SectionsArrayInput } from "@tinloof/sanity-studio";
import { defineType } from "sanity";

import sections from "../sections";

export let sectionsBody = defineType({
  name: "sectionsBody",
  title: "Sections",
  type: "array",
  of: sections.map((section) => ({
    type: section.name,
  })),
  components: {
    input: SectionsArrayInput,
  },
});
