import { defineArrayMember } from "sanity";
import { admonition } from "../objects/admonition";
const STYLE_LABELS = {
  h2: "Section heading",
  h3: "Sub-section",
  h4: "H4",
  h5: "H5",
  blockquote: "Quote",
};

export function getCustomBody({
  lists = false,
  styles = false,
  inlineBlockTypes = [],
  blockTypes = [],
}: {
  lists?: boolean;
  styles?: boolean | ("h2" | "h3" | "blockquote")[];
  blockTypes?: string[];
  inlineBlockTypes?: string[];
} = {}) {
  const availableStyles =
    styles === false
      ? []
      : styles === true
        ? ["h2", "h3", "h4", "h5", "blockquote"]
        : styles;

  return {
    type: "array",
    of: [
      defineArrayMember({
        type: "block",
        lists: lists
          ? [
              { title: "Bullet list", value: "bullet" },
              { title: "Numbered list", value: "number" },
            ]
          : [],
        styles: availableStyles.length
          ? [
              { title: "Paragraph", value: "normal" },
              ...availableStyles.map((h) => ({
                title: STYLE_LABELS[h as keyof typeof STYLE_LABELS] || h,
                value: h,
              })),
            ]
          : [],
        marks: {
          annotations: [
            admonition,
            {
              name: "link",
              type: "object",
              fields: [
                {
                  name: "href",
                  title: "URL",
                  type: "string",
                  description: "e.g. https://example.com or /about-page",
                  validation: (Rule) => Rule.required(),
                },
              ],
            },
          ],
        },
        of: inlineBlockTypes.map((type) => ({ type })),
      }),
      ...blockTypes.map((type) => ({ type })),
    ],
  };
}
