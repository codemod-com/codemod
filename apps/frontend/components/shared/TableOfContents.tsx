"use client";

import type { BlocksBody } from "@/types";
import { getPtComponentId } from "@/utils/ids";
import { capitalize } from "@/utils/strings";
import { toPlainText } from "@portabletext/react";
import { cx } from "cva";
import { useRouter } from "next/navigation";
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import KeepVisible from "../global/KeepVisible";

function throttle(func, delay) {
  let inProgress = false;
  return function () {
    if (inProgress) return;
    inProgress = true;
    func.apply(this, arguments);
    setTimeout(() => {
      inProgress = false;
    }, delay);
  };
}

let TableOfContents = ({
  outlines,
  title,
  children,
  variant = "default",
}: PropsWithChildren<{
  outlines: {
    block: BlocksBody;
    isSub: boolean;
  }[];
  variant?: "default" | "sidebar";
  title: string;
}>) => {
  let [activeHeadingIndex, setActiveHeadingIndex] = useState(0);
  let [tYAmount, setTYAmount] = useState({ solid: 0, shadow: 0 });
  let router = useRouter();
  let outlineRefs = useRef<HTMLDivElement[]>([]);
  let tocRef = useRef<HTMLDivElement | null>(null);

  let scrollToPt = (ptId: string) => {
    let ptElem = document.getElementById(ptId);
    ptElem?.scrollIntoView({
      behavior: "smooth",
    });
  };

  let updateTyAmount = useCallback(
    (index, type: "solid" | "shadow") => {
      let tocRect = tocRef.current?.getBoundingClientRect();
      let selectedOutlineRect =
        outlineRefs.current[index]?.getBoundingClientRect();
      let yDiff = selectedOutlineRect?.top! - tocRect?.top!;
      setTYAmount({ ...tYAmount, [type]: yDiff });
    },
    [tYAmount],
  );

  useEffect(() => {
    let activeIndex =
      outlines?.findIndex(
        (item) =>
          getPtComponentId(item as any) === window?.location?.hash?.slice(1),
      ) ?? -1;
    setActiveHeadingIndex(activeIndex === -1 ? 0 : activeIndex);
    let ptId = getPtComponentId(outlines[activeIndex] as any);
    scrollToPt(ptId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let handleClick = (item: BlocksBody, index: number) => {
    let ptId = getPtComponentId(item as any);
    scrollToPt(ptId);
    setActiveHeadingIndex(index);
    router.replace(`#${ptId}`);
    updateTyAmount(index, "solid");
  };

  let toPlainTextCapitalized = (block: BlocksBody) => {
    return capitalize(toPlainText(block).toLocaleLowerCase());
  };

  let onScroll = useCallback(() => {
    let index = 0;
    for (let heading of outlines || []) {
      let headingElement = document.getElementById(
        `${getPtComponentId(heading.block as any)}`,
      );
      if (headingElement) {
        let rect = headingElement.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= 300) {
          window.history.replaceState(
            null,
            "",
            `#${getPtComponentId(heading.block as any)}`,
          );
          setActiveHeadingIndex(index);
          break;
        }
      }

      index++;
    }
  }, [outlines]);

  useEffect(() => {
    window.addEventListener("scroll", throttle(onScroll, 100));

    return () => {
      window.removeEventListener("scroll", throttle(onScroll, 100));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="relative h-full w-full scrollbar-color">
        <div className="sticky top-36 overflow-y-scroll pl-1 max-h-screen ">
          <div className="h-max">
            {children}
            <p
              className={cx(
                "body-s-medium font-medium  text-secondary-light dark:text-secondary-dark ",
                {
                  "mb-6": variant === "default",
                  "mb-2": variant === "sidebar",
                },
              )}
            >
              {title}
            </p>
            <div ref={tocRef} className="group relative">
              {variant === "default" && (
                <div className="absolute left-0 top-0 z-0 h-full w-px bg-gradient-to-b from-transparent via-black dark:via-white" />
              )}
              {variant === "default" && (
                <div
                  style={{
                    transform: `translateY(${tYAmount.solid}px)`,
                  }}
                  className="dot absolute -left-[2px] top-3  z-20 h-[5px] w-[5px] rounded-full bg-background-dark transition-transform duration-150 ease-in-out dark:bg-white"
                />
              )}
              {variant === "default" && (
                <div
                  style={{
                    transform: `translateY(${tYAmount.shadow}px)`,
                  }}
                  className="shadow-dot absolute -left-[2px] top-3 z-10 h-[5px] w-[5px] scale-0 rounded-full bg-[#c1c1c1] opacity-0 transition-all duration-150 ease-in-out group-hover:scale-100 group-hover:opacity-100 dark:bg-white"
                />
              )}
              {outlines?.map(
                (
                  item: {
                    block: BlocksBody;
                    isSub: boolean;
                  },
                  index,
                ) =>
                  item.isSub ? (
                    <div
                      key={index}
                      className={cx(" cursor-pointer font-medium", {
                        "body-s-medium py-1 pl-9": variant === "default",
                        "body-m-medium py-1 pl-5": variant === "sidebar",
                      })}
                      ref={(el) => {
                        outlineRefs.current[index] = el as HTMLDivElement;
                      }}
                    >
                      <a
                        className={cx("transition-colors duration-100", {
                          " text-primary-light dark:text-primary-dark":
                            activeHeadingIndex === index,
                          "text-secondary-light dark:text-secondary-dark":
                            activeHeadingIndex !== index,
                        })}
                        onClick={() => handleClick(item.block, index)}
                        onMouseEnter={() => updateTyAmount(index, "shadow")}
                      >
                        {toPlainTextCapitalized(item.block)}
                      </a>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className={cx("cursor-pointer font-medium ", {
                        "body-m-medium pl-0": variant === "sidebar",
                        "mt-4 pb-0": index !== 0 && variant === "sidebar",
                        "pb-0 pt-0": index === 0 && variant === "sidebar",

                        "body-l-medium pl-4": variant === "default",
                        "pb-4 pt-0": index === 0 && variant === "default",
                        "mt-4 pb-4": index !== 0 && variant === "default",
                      })}
                      ref={(el) => {
                        outlineRefs.current[index] = el as HTMLDivElement;
                      }}
                      onMouseEnter={() => updateTyAmount(index, "shadow")}
                    >
                      <a
                        className={cx("transition-colors duration-300", {
                          "font-medium text-primary-light dark:text-primary-dark":
                            activeHeadingIndex === index,
                          "text-secondary-light dark:text-secondary-dark":
                            activeHeadingIndex !== index,
                        })}
                        onClick={() => handleClick(item.block, index)}
                      >
                        {toPlainTextCapitalized(item.block)}
                      </a>
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableOfContents;
