import { defineType } from "sanity";
import { imageWithAltField } from "../shared/imageWithAltField";

export let imageBlock = defineType({
  type: "object",
  name: "imageBlock",
  title: "Image",
  fields: [
    { ...imageWithAltField, name: "image" },
    { type: "string", name: "caption", title: "Caption" },
  ],
});
