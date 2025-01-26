"use client";

import GradientBorderBox from "@/components/shared/GradientBorderBox";
import LinkButton from "@/components/shared/LinkButton";
import Snippet from "@/components/shared/Snippet";
import Tag from "@/components/shared/Tag";
import MuxVideo from "@/components/shared/Video/MuxVideo";
import type { FeaturesProps } from "@/types/section.types";
import { cx } from "cva";
import { useState } from "react";

export default function Features(props: FeaturesProps) {
  const [interactionState, setInteractionState] = useState(
    props.features?.reduce((o, key) => ({ ...o, [key._key!]: false }), {}) ||
      {},
  );

  const getSides = (index: number) => ({
    right: true,
    left: index === 1 || index === 3 || index === 4,
    bottom: index === 3 || index === 4 || index === 5,
    top: index === 1 || index === 2 || index === 3,
  });

  const getMobileSides = (index: number) => ({
    right: true,
    left: true,
    bottom: index === 5,
    top: true,
  });

  function handleInteraction(_key: string) {
    setInteractionState((prev) => ({ ...prev, [_key]: true }));
    setTimeout(() => {
      setInteractionState((prev) => ({ ...prev, [_key]: false }));
    }, 1000);
  }

  const renderBackground = (
    background: any,
    replay: boolean,
    isDark: boolean,
  ) => {
    if (!background) return null;

    const version = isDark ? background.dark : background.light;

    if (version?.type === "video" && version.asset) {
      return (
        <MuxVideo
          replay={replay}
          playOnView
          className={isDark ? "hidden dark:block" : "dark:hidden"}
          video={version.asset.asset}
        />
      );
    }

    if (version?.type === "image" && version.image) {
      return (
        <img
          className={
            isDark
              ? "hidden dark:block w-full aspect-[2/1] object-cover"
              : "dark:hidden w-full aspect-[2/1] object-cover"
          }
          src={version.image.asset?.url}
          alt=""
        />
      );
    }

    return null;
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden w-full px-6 py-[60px] lg:grid lg:grid-cols-2 lg:px-20 lg:py-[80px]">
        {props?.features?.map((feature, index) => {
          const size = index === 2 ? "large" : "small";

          return (
            <div
              key={feature._key}
              className={cx(
                "relative",
                size === "small" ? "col-span-1" : "col-span-full",
              )}
            >
              <div
                className={cx("absolute z-10", {
                  "left-0 top-0 w-full": size === "small",
                  "right-0 top-1/2 my-auto w-1/2 -translate-y-1/2 transform":
                    size !== "small",
                })}
              >
                {renderBackground(
                  feature.background,
                  interactionState[feature._key!],
                  true,
                )}
                {renderBackground(
                  feature.background,
                  interactionState[feature._key!],
                  false,
                )}
                <div className="absolute bottom-0 h-1/4 w-full bg-gradient-to-t from-white dark:from-background-dark" />
              </div>

              <GradientBorderBox
                className={cx("max-w-full")}
                sides={getSides(index + 1)}
              >
                <div
                  className={cx(
                    "flex h-[600px] flex-col items-start p-l lg:p-xl",
                    size === "small"
                      ? "justify-end lg:h-[586px]"
                      : "max-w-[460px] justify-center lg:h-[590px]",
                  )}
                >
                  {feature?.tag ? (
                    <div className="z-10 mb-s">
                      <Tag intent="static">{feature.tag}</Tag>
                    </div>
                  ) : null}

                  <h2 className="m-heading mb-xs max-w-[460px]">
                    {feature.title}
                  </h2>
                  <p className="body-l mb-m max-w-[460px]">
                    {feature.description}
                  </p>

                  {feature.snippet ? (
                    <Snippet
                      toastText={feature.toastText}
                      onCopy={() => handleInteraction(feature._key!)}
                      command={feature.snippet}
                    />
                  ) : null}

                  {feature.cta ? (
                    <LinkButton
                      onMouseEnter={() => handleInteraction(feature._key!)}
                      intent="secondary"
                      href={feature?.cta?.href}
                    >
                      {feature?.cta?.label}
                    </LinkButton>
                  ) : null}
                </div>
              </GradientBorderBox>
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="grid w-full grid-cols-2 px-6 py-[60px] lg:hidden lg:px-20 lg:py-[80px]">
        {props?.features?.map((feature, index) => {
          return (
            <div key={feature._key} className={cx("col-span-2")}>
              <GradientBorderBox
                className={cx("max-w-full")}
                sides={getMobileSides(index + 1)}
              >
                <div
                  className={cx(
                    "flex flex-col items-start justify-end p-l lg:p-xl",
                  )}
                >
                  <div className={cx("-mt-l w-full sm:-mx-l", {})}>
                    {renderBackground(
                      feature.background,
                      interactionState[feature._key!],
                      true,
                    )}
                    {renderBackground(
                      feature.background,
                      interactionState[feature._key!],
                      false,
                    )}
                  </div>
                  {feature?.tag ? (
                    <div className="z-10 mb-s">
                      <Tag intent="static">{feature.tag}</Tag>
                    </div>
                  ) : null}

                  <h2 className="m-heading mb-xs max-w-[460px]">
                    {feature.title}
                  </h2>
                  <p className="body-l mb-m max-w-[460px]">
                    {feature.description}
                  </p>

                  {feature.snippet ? (
                    <Snippet
                      toastText={feature.toastText}
                      onCopy={() => handleInteraction(feature._key!)}
                      command={feature.snippet}
                    />
                  ) : null}

                  {feature.cta ? (
                    <LinkButton
                      onMouseEnter={() => handleInteraction(feature._key!)}
                      intent="secondary"
                      href={feature?.cta?.href}
                    >
                      {feature?.cta?.label}
                    </LinkButton>
                  ) : null}
                </div>
              </GradientBorderBox>
            </div>
          );
        })}
      </div>
    </>
  );
}
