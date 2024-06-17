"use client";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";
import { cx } from "cva";
import { motion } from "framer-motion";
import { useMedia } from "react-use";
import { SanityImage } from "./SanityImage";
import { SanityLink } from "./SanityLink";
export default function InfiniteSlider({
  items,
  direction = "left",
  className,
}: {
  className?: string;
  items?: {
    link?: string;
    alt?: string;
    lightModeImage?: SanityImageObject & { alt?: string };
    darkModeImage?: SanityImageObject & { alt?: string };
  }[];
  direction?: "left" | "right";
}) {
  let isMobile = useMedia("(max-width: 768px)");
  if (!items?.length) {
    return null;
  }

  let _items = items
    .concat(items)
    .concat(items)
    .concat(items)
    .concat(items)
    .concat(items);
  return (
    <div className={cx("relative block max-w-full overflow-hidden")}>
      <EdgeFadeWrapper>
        <motion.div
          className={cx("flex", className)}
          transition={{
            ease: "linear",
            duration: isMobile ? 60 : 160,
            repeat: Number.POSITIVE_INFINITY,
          }}
          animate={{
            x: direction === "left" ? ["0%", `-520%`] : ["0%", `520%`],
          }}
        >
          {_items?.map((item, index) => {
            return (
              <motion.div
                key={`${index}`}
                className="flex flex-shrink-0 items-center px-10"
              >
                <SanityLink link={{ href: item?.link, _type: "link" }}>
                  {item?.lightModeImage && (
                    <SanityImage
                      maxWidth={400}
                      image={item?.lightModeImage}
                      elProps={{
                        alt: item?.lightModeImage?.alt,
                        className:
                          "w-24 max-h-[48px] object-cover dark:hidden relative",
                      }}
                    />
                  )}
                  {item?.darkModeImage && (
                    <SanityImage
                      maxWidth={400}
                      image={item?.darkModeImage}
                      elProps={{
                        alt: item?.darkModeImage?.alt,
                        className:
                          "w-24 max-h-[48px] object-cover hidden dark:block relative",
                      }}
                    />
                  )}
                </SanityLink>
              </motion.div>
            );
          })}
        </motion.div>
      </EdgeFadeWrapper>
    </div>
  );
}

let EdgeFadeWrapper = ({ children }) => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-px -top-6 z-10 h-24 w-4 bg-gradient-to-r from-white px-4 py-2 md:w-8 lg:w-24 dark:from-[#0b151e] dark:via-[#0b151e]" />
      <div className="pointer-events-none absolute -top-6 right-0 z-10 h-24 w-4 bg-gradient-to-l from-white px-4 py-2 md:w-8 lg:w-24 dark:from-[#0b151e] dark:via-[#0b151e]" />
      {children}
    </div>
  );
};
