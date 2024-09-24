import type { QuoteProps } from "@/types/object.types";
import { SanityImage } from "../SanityImage";

export const Quote = (props: QuoteProps) => {
  return (
    <blockquote className="mt-4 border-l-2 border-black pl-6">
      {props.image && (
        <SanityImage
          maxWidth={450}
          image={props.image}
          elProps={{ className: "mb-10 block", height: 40, width: "auto" }}
          alt={props.authorImage?.alt}
        />
      )}
      <q className="s-heading mb-8 block max-w-2xl font-medium">
        {props.quote}
      </q>
      <div className="flex gap-2">
        {props.authorImage && (
          <SanityImage
            elProps={{ className: "rounded-sm w-11 h-11" }}
            maxWidth={100}
            image={props.authorImage}
            alt={props.authorImage?.alt}
          />
        )}
        <div className="flex flex-col gap-1">
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
  return (
    <div className="mt-10">
      <Quote {...props} />
    </div>
  );
}
