import type { QuoteProps } from "@/types/object.types";
import { SanityImage } from "../SanityImage";

export const Quote = (props: QuoteProps) => {
  return (
    <blockquote className="my-10">
      {props.image && (
        <SanityImage
          maxWidth={450}
          image={props.image}
          elProps={{ className: "mb-6 block h-10 w-auto" }}
          alt={props.authorImage?.alt}
        />
      )}
      <q className="body-l-medium lg:m-heading mb-8 block font-medium">
        {props.quote}
      </q>
      <div className="flex items-center gap-3">
        {props.authorImage && (
          <SanityImage
            elProps={{ className: "rounded-full w-8 h-8" }}
            maxWidth={100}
            image={props.authorImage}
            alt={props.authorImage?.alt}
          />
        )}
        <div className="flex items-center flex-row flex-wrap gap-1">
          <cite className="body-s-medium font-medium not-italic">
            {props.authorName}
          </cite>
          {props.authorPosition && (
            <span className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
              {props.authorPosition}
            </span>
          )}
        </div>
      </div>
    </blockquote>
  );
};

export default function QuoteBlock(props: QuoteProps) {
  return <Quote {...props} />;
}
