import { CodeIcon } from "@sanity/icons";

import { commonSyntaxList } from "@/sanity/lib/components/codeLangs";
import { capitalize } from "@/utils/strings";
import { defineType } from "sanity";

export const codeSnippet = defineType({
  name: "codeSnippet",
  title: "Code Snippet",
  type: "object",
  icon: CodeIcon,
  fields: [
    {
      name: "code",
      title: "Code",
      type: "code",
      options: {
        language: "typescript",
        languageAlternatives: commonSyntaxList,
      },
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      code: "code",
    },
    prepare({ code }) {
      return {
        title: `${code?.language ? capitalize(code.language) : "Code"} snippet`,
      };
    },
  },
});
