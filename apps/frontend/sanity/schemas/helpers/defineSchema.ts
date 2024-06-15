import { CogIcon, ComposeIcon } from "@sanity/icons";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { uniqBy } from "lodash";
import type { SortOrdering } from "sanity";
import type { DocumentDefinition } from "sanity";

export type SchemaDefinition = Omit<DocumentDefinition, "options"> & {
  options?: {
    orderable?: boolean;
    disableCreation?: boolean;
    localized?: boolean;
    hideInternalTitle?: boolean;
  };
};

export default function defineSchema(schema: SchemaDefinition) {
  let groups = uniqBy(
    [
      {
        name: "content",
        title: "Content",
        icon: ComposeIcon,
        // biome-ignore lint/complexity/noUselessTernary: ?
        default: schema?.groups?.some((group) => group.default) ? false : true,
      },
      {
        name: "settings",
        title: "Settings",
        icon: CogIcon,
      },
      ...(schema.groups || []),
    ].filter(Boolean),
    "name",
  );

  return {
    ...schema,
    groups,
    orderings: schema.options?.orderable
      ? [...(schema.orderings || []), orderRankOrdering as SortOrdering]
      : schema.orderings,
    fields: uniqBy(
      [
        ...(schema.options?.orderable
          ? [orderRankField({ type: schema.name })]
          : []),
        ...schema.fields,
      ].filter(Boolean),
      "name",
    ),
  };
}
