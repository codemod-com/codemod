import { getCustomBody } from "../helpers/getCustomBody";

export const richText = {
  name: "richtext",
  title: "Rich Text",
  ...getCustomBody({
    styles: true,
    lists: true,
  }),
};
