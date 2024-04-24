import Video from "@/components/shared/Video";
import type { MuxVideoBlock, YoutubeVideoBlock } from "@/types/object.types";
import { cx } from "cva";

export default function VideoBlock(props: MuxVideoBlock | YoutubeVideoBlock) {
  return (
    <div className="my-10 flex flex-col">
      <div className={cx("overflow-hidden rounded-lg", "aspect-[16/9.3]")}>
        <Video {...props} />
      </div>
      {props.caption && (
        <p className="body-s-medium mt-1 font-medium text-secondary-light dark:text-secondary-dark">
          {props.caption}
        </p>
      )}
    </div>
  );
}
