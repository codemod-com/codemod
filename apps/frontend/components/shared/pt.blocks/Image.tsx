import type { ImageBlock } from "@/types/object.types";
import { cx } from "cva";
import { SanityImage } from "../SanityImage";

export default function ImageBlock(props: ImageBlock) {
  return (
    <div className="my-10 flex flex-col ">
      <div className={cx("overflow-hidden rounded-lg")}>
        {<SanityImage maxWidth={1440} image={props.image} />}
      </div>
      {props.image?.alt && (
        <p className="body-s-medium mt-1 font-medium text-secondary-light dark:text-secondary-dark">
          {props.image?.alt}
        </p>
      )}
    </div>
  );
}
