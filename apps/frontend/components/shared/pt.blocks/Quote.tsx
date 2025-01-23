"use client";
import TextRotate from "@/components/templates/i18nPage/Cobe/TextRotate";
import type { QuoteProps } from "@/types/object.types";
import { LayoutGroup, motion, useInView } from "motion/react";
import { useRef } from "react";
import { SanityImage } from "../SanityImage";

export const Quote = (props: QuoteProps) => {
  const blockquoteRef = useRef<HTMLQuoteElement>(null);
  const inView = useInView(blockquoteRef, {
    once: true,
    margin: "0% 0%",
  });

  return (
    <blockquote
      ref={blockquoteRef}
      className="my-6 py-4 border-y border-black/10 dark:border-white/10"
    >
      <LayoutGroup>
        {props.quote && (
          <motion.p
            className="body-l-medium lg:m-heading mb-5 !font-bold !pb-0 min-h-32"
            layout
          >
            <TextRotate
              texts={["", `“${props.quote}”`]}
              auto={inView}
              staggerFrom={"first"}
              staggerDuration={0.03}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              elementLevelClassName="inline whitespace-nowrap"
              loop={false}
              rotationInterval={50}
              splitBy="words"
            />
          </motion.p>
        )}
        <div className="flex items-center gap-3">
          <motion.div
            className="relative w-8 h-8 rounded-full dark:bg-white/20 bg-black/20"
            initial={{ opacity: 0 }}
            animate={inView && { opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {props.authorImage && (
              <SanityImage
                elProps={{ className: "rounded-full w-8 h-8 object-cover" }}
                maxWidth={100}
                image={props.authorImage}
                alt={props.authorImage?.alt}
              />
            )}
            {props.image && (
              <SanityImage
                maxWidth={64}
                image={props.image}
                elProps={{
                  className:
                    "h-4 w-4 absolute bottom-0 right-0 z-10 rounded-full dark:bg-white/20 bg-black/20 object-cover",
                }}
                alt={props.authorImage?.alt}
              />
            )}
          </motion.div>
          <div className="flex items-center flex-row flex-wrap gap-1">
            {props.authorName && (
              <cite className="body-s-medium font-medium not-italic">
                <TextRotate
                  texts={["", props.authorName]}
                  auto={inView}
                  staggerFrom={"first"}
                  staggerDuration={0.04}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  loop={false}
                  rotationInterval={1000}
                  splitBy="words"
                />
              </cite>
            )}

            {props.authorPosition && (
              <span className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
                <TextRotate
                  texts={["", props.authorPosition]}
                  auto={inView}
                  staggerFrom={"first"}
                  staggerDuration={0.04}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  loop={false}
                  rotationInterval={1500}
                  splitBy="words"
                />
              </span>
            )}
          </div>
        </div>
      </LayoutGroup>
    </blockquote>
  );
};

export default function QuoteBlock(props: QuoteProps) {
  return <Quote {...props} />;
}
