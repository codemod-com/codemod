import Icon, { TechLogo } from "@/components/shared/Icon";
import { ThListIcon } from "@sanity/icons";
import { defineType } from "sanity";
import { icon, logo } from "../objects/icon";

const SUBMENUS = [
  { title: "Product", value: "product" },
  { title: "Company", value: "company" },
  { title: "Legal", value: "legal" },
];

export default defineType({
  type: "document",
  name: "footer",
  icon: ThListIcon,
  fields: [
    {
      type: "string",
      name: "title",
      title: "Internal Title",
      hidden: true,
    },
    {
      type: "richtext",
      name: "footerText",
      title: "Footer Text",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [{ type: "link", name: "link", title: "Link" }, logo],
          preview: {
            select: { title: "link.label", logo: "logo" },
            prepare({ title, logo }) {
              return { title, media: <TechLogo name={logo} /> };
            },
          },
        },
      ],
    },
    {
      name: "footerNavigationItems",
      title: "Footer Navigation items",
      type: "array",
      of: [
        {
          type: "object",
          icon: ThListIcon,
          fields: [
            {
              type: "string",
              name: "submenu",
              title: "Submenu",
              options: {
                list: [
                  { title: "Product", value: "product" },
                  { title: "Company", value: "company" },
                  { title: "Legal", value: "legal" },
                ],
              },
            },
            {
              name: "links",
              title: "Footer Links",
              type: "array",
              of: [{ type: "link" }],
            },
          ],
          preview: {
            select: {
              submenu: "submenu",
            },
            prepare({ submenu }) {
              const title = SUBMENUS.find(
                (item) => item.value === submenu,
              )?.title;
              return {
                title,
              };
            },
          },
        },
      ],
    },
  ],
});
