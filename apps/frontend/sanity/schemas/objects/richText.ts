import { getCustomBody } from "../helpers/getCustomBody";

export let richText = {
  name: "richtext",
  title: "Rich Text",
  ...getCustomBody({
    styles: true,
    lists: true,
  }),
};
