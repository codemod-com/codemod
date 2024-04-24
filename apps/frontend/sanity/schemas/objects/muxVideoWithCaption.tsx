import Icon from "@/components/shared/Icon";
import { muxVideo } from "./muxVideo";

export const muxVideoWithCaption = {
  type: "object",
  name: "muxVideoWithCaption",
  title: "Video",
  fields: [
    ...muxVideo.fields,
    {
      type: "string",
      name: "caption",
      title: "Caption",
    },
  ],
  preview: {
    select: {
      title: "caption",
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: title,
        media: <Icon name="play" />,
      };
    },
  },
};
