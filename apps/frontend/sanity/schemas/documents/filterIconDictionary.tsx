// import ColorInput from "@/sanity/components/ColorInput";
import { FilterIcon } from "@sanity/icons";

import Icon from "@/components/shared/Icon";
import FilterSelector from "@/sanity/lib/components/FilterIconPicker";
import FilterValueIconPicker from "@/sanity/lib/components/FilterValueIconPicker";
import { capitalize, unslugify } from "@/utils/strings";
import defineSchema from "../helpers/defineSchema";
import { icon } from "../objects/icon";
import { logoFields } from "../shared/logoFields";

export const filterIconDictionary = defineSchema({
  name: "filterIconDictionary",
  title: "Filter Icons",
  type: "document",
  icon: FilterIcon,
  options: {
    disableCreation: true,
  },
  fields: [
    {
      name: "filters",
      type: "array",
      title: "Filters",
      validation: (Rule) => Rule.unique(),
      of: [
        {
          type: "object",
          fields: [
            {
              name: "filterId",
              type: "string",
              title: "Name",
              description: "Match the id of the filter in the API.",
              components: {
                input: FilterSelector,
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "filterValues",
              type: "array",
              title: "Filter Values",

              validation: (Rule) => Rule.required(),
              //   components: {
              //     input: ColorInput,
              //   },
              of: [
                {
                  type: "object",
                  description:
                    "Use an icon OR an image, not both. Images will take precedence over icons if both are added.",
                  fields: [
                    {
                      name: "filterValue",
                      description:
                        "Match the id of the filter value in the API.",
                      type: "string",
                      title: "Name",
                      components: {
                        input: FilterValueIconPicker,
                      },
                      validation: (Rule) => Rule.required(),
                    },
                    icon,
                    ...logoFields.map((field) => ({
                      ...field,
                      fields: field.fields.map((field) => ({
                        ...field,
                        validation: undefined,
                      })),
                      validation: undefined,
                    })),
                  ],
                  preview: {
                    select: {
                      name: "filterValue",
                      icon: "icon",
                      darkLogo: "darkModeImage",
                      lightLogo: "lightModeImage",
                    },
                    prepare({ name, icon, darkLogo, lightLogo }) {
                      return {
                        title: capitalize(unslugify(name)),
                        media:
                          lightLogo || darkLogo
                            ? lightLogo || darkLogo
                            : icon && <Icon name={icon} />,
                      };
                    },
                  },
                },
              ],
            },
          ],
          preview: {
            select: {
              name: "filterId",
            },
            prepare({ name }) {
              return {
                title: capitalize(unslugify(name)),
                media: <Icon name="filter" />,
              };
            },
          },
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return {
        title: "Filter Icons",
      };
    },
  },
});
