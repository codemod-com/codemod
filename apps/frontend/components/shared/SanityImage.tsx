import { getImageProps } from "@/utils/getImageProps";
import clsx from "clsx";
import type { CSSProperties } from "react";
import type React from "react";
import { preload } from "react-dom";

type SanityImageBaseProps = {
  alt?: string;
  loading?: "lazy" | "eager";
  preload?: boolean;
  applyHotspot?: boolean;
  elProps?: Partial<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >
  >;
} & Parameters<typeof getImageProps>[0];

export function SanityImage({
  alt,
  elProps = {},
  preload: shouldPreload,
  loading = "lazy",
  ...props
}: SanityImageBaseProps) {
  const image = props.image;
  const maxWidth = props.maxWidth || 0;

  if (!image) return null;

  // Handle light/dark mode images
  const lightImage = image?.lightImage || image; // Fallback for legacy
  const darkImage = image?.darkImage;

  // Get image props
  const lightProps = lightImage?.asset
    ? getImageProps({ image: lightImage, maxWidth })
    : null;
  const darkProps = darkImage?.asset
    ? getImageProps({ image: darkImage, maxWidth })
    : null;

  // Extract className from elProps to avoid spreading it
  const { className, ...restElProps } = elProps;

  // Apply hotspot styles
  const hotspotStyle: CSSProperties = props.applyHotspot
    ? {
        objectFit: "cover",
        objectPosition: lightImage?.hotspot
          ? `${lightImage.hotspot.x * 100}% ${lightImage.hotspot.y * 100}%`
          : undefined,
      }
    : {};

  const style = { ...hotspotStyle, ...lightProps?.style, ...restElProps.style };

  // Preload logic for light mode image
  if (shouldPreload && lightProps?.src) {
    preload(lightProps.src as string, {
      fetchPriority: "high",
      imageSizes: restElProps.sizes ?? lightProps.sizes,
      imageSrcSet: restElProps.srcSet ?? lightProps.srcSet,
      as: "image",
    });
  }

  return (
    <>
      {/* Light Mode Image */}
      {lightProps?.src && (
        <img
          src={lightProps.src}
          alt={alt || lightImage?.alt || ""}
          className={clsx(
            darkProps?.src && "block dark:hidden",
            className, // Add user-provided className here
          )}
          style={style}
          {...restElProps} // Spread elProps without className
        />
      )}

      {/* Dark Mode Image */}
      {darkProps?.src && (
        <img
          src={darkProps.src}
          alt={alt || darkImage?.alt || ""}
          className={clsx("hidden dark:block", className)}
          style={style}
          {...restElProps}
        />
      )}
    </>
  );
}
