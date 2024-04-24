import { getImageProps } from "@/utils/getImageProps";
import type { CSSProperties } from "react";
import type React from "react";
import { preload } from "react-dom";

type SanityImageBaseProps = {
  alt?: string;
  loading?: "lazy" | "eager";
  preload?: boolean;
  /**
   * If this <img> component's size is constrained in ways that force it to have a different
   * aspect-ratio than the native image, then `applyHotspot` will apply a CSS `object-position`
   * to reflect the hotspot selected by editors in Sanity.
   *
   * @see https://toolkit.tinloof.com/images
   */
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
  const imageProps = getImageProps(props);

  const hotspotStyle: CSSProperties = props.applyHotspot
    ? {
        objectFit: "cover",
        objectPosition: props.image?.hotspot
          ? `${props.image?.hotspot.x * 100}% ${props.image?.hotspot.y * 100}%`
          : undefined,
      }
    : {};
  const style = { ...hotspotStyle, ...imageProps.style, ...elProps.style };

  if (!imageProps?.src) {
    return null;
  }

  if (shouldPreload) {
    preload(imageProps.src as string, {
      fetchPriority: "high",
      imageSizes: elProps.sizes ?? imageProps.sizes,
      imageSrcSet: elProps.srcSet ?? imageProps.srcSet,
      // @ts-ignore
      as: "image",
    });
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageProps.src as string}
      alt={alt || props.image.alt || props.image.caption || ""}
      {...imageProps}
      {...elProps}
      style={style}
      loading={loading}
    />
  );
}
