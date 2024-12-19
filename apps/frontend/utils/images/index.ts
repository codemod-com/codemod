import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";

export type ExtendedSanityImageObject = SanityImageObject & {
  alt?: string;
  caption?: string;
  lightImage?: SanityImageObject;
  darkImage?: SanityImageObject;
};

export function getImageDimensions(
  image: SanityImageObject,
): { width: number; height: number; aspectRatio: number } | undefined {
  if (!image?.asset?._ref) {
    return;
  }

  const dimensions = image.asset._ref.split("-")[2];
  const [width, height] = dimensions.split("x").map(Number);

  if (!width || !height || Number.isNaN(width) || Number.isNaN(height)) {
    return;
  }

  if (image.crop) {
    const croppedWidth =
      width * (1 - (image.crop?.right || 0) - (image.crop?.left || 0));
    const croppedHeight =
      height * (1 - (image.crop?.top || 0) - (image.crop?.bottom || 0));
    return {
      width: croppedWidth,
      height: croppedHeight,
      aspectRatio: croppedWidth / croppedHeight,
    };
  }

  return {
    width,
    height,
    aspectRatio: width / height,
  };
}

const LARGEST_VIEWPORT = 1920;
const DEFAULT_MIN_STEP = 0.1;
const DEFAULT_WIDTH_STEPS = [400, 600, 850, 1000, 1150];
const DEFAULT_FULL_WIDTH_STEPS = [360, 414, 768, 1366, 1536, 1920];

export function createGetImageProps(imageBuilder: ImageUrlBuilder) {
  return function getImageProps(props: {
    image: ExtendedSanityImageObject;
    imageTransformer?: (builder: ImageUrlBuilder) => ImageUrlBuilder;
    maxWidth: number | string;
    minimumWidthStep?: number;
    customWidthSteps?: number[];
    customSizes?: string;
    forcedAspectRatio?: number;
    forceAspectRatio?: number; // Deprecated
  }): Pick<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    "src" | "srcSet" | "style" | "sizes" | "width" | "height"
  > {
    if (!props.image?.asset?._ref) {
      return {};
    }

    const {
      image,
      customWidthSteps,
      customSizes,
      minimumWidthStep = DEFAULT_MIN_STEP,
    } = props;

    if (
      typeof props.maxWidth === "string" &&
      !/^\d{1,3}vw$/.test(props.maxWidth)
    ) {
      return {};
    }

    const maxWidth =
      typeof props.maxWidth === "number"
        ? props.maxWidth
        : Math.round(
            LARGEST_VIEWPORT * (Number(props.maxWidth.match(/\d*/)?.[0]) / 100),
          );

    const baseBuilder = imageBuilder.image(image).fit("max").auto("format");
    const builder = props.imageTransformer
      ? props.imageTransformer(baseBuilder)
      : baseBuilder;

    const imageDimensions = getImageDimensions(image);

    if (!imageDimensions) {
      return {};
    }

    const baseSizes = [
      maxWidth,
      ...(customWidthSteps ||
        (typeof props.maxWidth === "number"
          ? DEFAULT_WIDTH_STEPS
          : DEFAULT_FULL_WIDTH_STEPS)),
    ];

    const retinaSizes = Array.from(
      new Set([
        ...baseSizes,
        ...baseSizes.map((size) => size * 2),
        ...baseSizes.map((size) => size * 3),
      ]),
    )
      .sort((a, b) => a - b)
      .filter(
        (size) =>
          (!imageDimensions?.width || size <= imageDimensions.width * 1.1) &&
          size <= maxWidth * 3,
      )
      .filter((size, i, arr) => {
        const nextSize = arr[i + 1];
        if (nextSize) {
          return nextSize / size > minimumWidthStep + 1;
        }
        return true;
      });

    const lastSize = retinaSizes.slice(-1)[0];
    if (lastSize < maxWidth && lastSize < imageDimensions.width) {
      retinaSizes.push(imageDimensions.width);
    }

    const aspectRatio =
      props.forcedAspectRatio ||
      props.forceAspectRatio ||
      imageDimensions.aspectRatio;

    try {
      return {
        style: {
          "--img-aspect-ratio": aspectRatio,
          "--img-natural-width": `${imageDimensions.width}px`,
        } as React.CSSProperties,

        src: builder
          .width(maxWidth)
          .height(
            props.forcedAspectRatio
              ? Math.round(maxWidth / props.forcedAspectRatio)
              : undefined,
          )
          .url(),

        srcSet: retinaSizes
          .map(
            (size) =>
              `${builder
                .width(size)
                .height(
                  props.forcedAspectRatio
                    ? Math.round(size / props.forcedAspectRatio)
                    : undefined,
                )
                .url()} ${size}w`,
          )
          .join(", "),

        sizes:
          customSizes ||
          (typeof props.maxWidth === "string"
            ? props.maxWidth
            : `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`),

        width: imageDimensions.width,
        height: Math.round(imageDimensions.width / aspectRatio),
      };
    } catch (error) {
      return {};
    }
  };
}
