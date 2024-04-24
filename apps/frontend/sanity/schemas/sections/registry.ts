import FilterIconPicker from "@/sanity/lib/components/FilterIconPicker";
import { BookIcon } from "@sanity/icons";
import { defineSection } from "@tinloof/sanity-studio";

export const registry = defineSection({
  title: "Registry Section",
  name: "section.registry",
  type: "object",
  options: {
    variants: [
      {
        assetUrl: "/static/blocks/registry.png",
      },
    ],
  },
  icon: BookIcon,
  fields: [
    {
      type: "string",
      name: "title",
      title: "Title",
    },
    {
      type: "text",
      rows: 3,
      name: "subtitle",
      title: "Subtitle",
    },
    {
      name: "initialAutomationSlugs",
      title: "Initial Automations",
      type: "array",
      of: [{ type: "string" }],
      description: "List of automation slugs to display in the registry",
      validation: (Rule) => Rule.unique().max(4),
    },
    {
      name: "searchPlaceholder",
      title: "Search placeholder",
      type: "string",
      description:
        'Placeholder text for the search input. Defaults to "Search for Codemods"',
    },
    {
      name: "ctaLabel",
      title: "CTA label",
      type: "string",
      description: 'Label for the CTA button. Defaults to "View all Codemods".',
    },
    {
      name: "automationFilter",
      title: "Automation filter",
      type: "string",
      description: "Select the automation filter to use for this section",
      components: {
        input: FilterIconPicker,
      },
    },
  ],
});
