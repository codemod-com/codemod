import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";

export function getImageDimensions(
	image: SanityImageObject,
): { width: number; height: number; aspectRatio: number } | undefined {
	if (!image?.asset?._ref) {
		return;
	}

	// example asset._ref:
	// image-7558c4a4d73dac0398c18b7fa2c69825882e6210-366x96-png
	// When splitting by '-' we can extract the dimensions, id and extension
	const dimensions = image.asset._ref.split("-")[2];
	const [width, height] = dimensions.split("x").map(Number);

	if (!width || !height || Number.isNaN(width) || Number.isNaN(height)) {
		return;
	}

	if (image.crop) {
		const croppedWidth =
			width * (1 - (image.crop?.right || 0) - image.crop?.left || 0);
		const croppedHeight =
			height * (1 - (image.crop?.top || 0) - image.crop?.bottom || 0);
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

const LARGEST_VIEWPORT = 1920; // Retina sizes will take care of 4k (2560px) and other huge screens

const DEFAULT_MIN_STEP = 0.1; // 10%
const DEFAULT_WIDTH_STEPS = [400, 600, 850, 1000, 1150]; // arbitrary
// Based on statcounter's most common screen sizes: https://gs.statcounter.com/screen-resolution-stats
const DEFAULT_FULL_WIDTH_STEPS = [360, 414, 768, 1366, 1536, 1920];

/**
 * Given an image reference and maxWidth, returns optimized srcSet and sizes properties for <img> elements
 */
export function createGetImageProps(imageBuilder: ImageUrlBuilder) {
	return function getImageProps(props: {
		image: SanityImageObject & { alt?: string; caption?: string };

		imageTransformer?: (builder: ImageUrlBuilder) => ImageUrlBuilder;

		/**
		 * Width of the image in Figma's desktop layout or "Xvw" if occupies a portion of the viewport's width
		 */
		maxWidth: number | string;

		/**
		 * The minimal width difference, in PERCENTAGE (decimal), between the image's srcSet variations.
		 *
		 * -> 0.10 (10%) by default.
		 */
		minimumWidthStep?: number;

		/**
		 * Custom widths to use for the image's `srcSet`.
		 * We'll multiply each by 2 & 3 to get the retina size variations.
		 */
		customWidthSteps?: number[];

		/**
		 * Custom value for the image's `sizes` attribute.
		 * Use this if your image follows a non-trivial layout that not `(max-width: ${MAX_WIDTH}) 100vw, ${MAX_WIDTH}`.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes
		 */
		customSizes?: string;

		/**
		 * Force a specific aspect ratio for the image.
		 * This will be reflected at the Sanity's CDN level - the download image will already be cropped by this aspect ratio, with hotspots applied.
		 *
		 * @example
		 * // Avatars with square/round images
		 * forceAspectRatio={1}
		 *
		 * // 16:9 video banner images
		 * forceAspectRatio={16/9}
		 */
		forcedAspectRatio?: number;

		/**
		 * @deprecated use `forcedAspectRatio` instead (renamed for clarity)
		 */
		forceAspectRatio?: number;
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
			// Must be NUMvw
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
			// De-duplicate sizes with a Set
			new Set([
				...baseSizes,
				...baseSizes.map((size) => size * 2),
				...baseSizes.map((size) => size * 3),
			]),
		)
			.sort((a, b) => a - b) // Lowest to highest

			.filter(
				(size) =>
					// Exclude sizes 10% or more larger than the image itself. Sizes slightly larger
					// than the image are included to ensure we always get closest to the highest
					// quality for an image. Sanity's CDN won't scale the image above its limits.
					(!imageDimensions?.width || size <= imageDimensions.width * 1.1) &&
					// Exclude those larger than maxWidth's retina (x3)
					size <= maxWidth * 3,
			)

			// Exclude those with a value difference to their following size smaller than `minimumWidthStep`
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
				} as React.HTMLAttributes<HTMLElement>["style"],

				src: builder
					.width(maxWidth)
					.height(
						props.forceAspectRatio
							? Math.round(maxWidth / props.forceAspectRatio)
							: (undefined as any as number),
					)
					.url(),

				srcSet: retinaSizes
					.map(
						(size) =>
							`${builder
								.width(size)
								.height(
									props.forceAspectRatio
										? Math.round(size / props.forceAspectRatio)
										: (undefined as any as number),
								)
								.url()} ${size}w`,
					)
					.join(", "),

				sizes:
					customSizes ||
					(typeof props.maxWidth === "string"
						? props.maxWidth
						: `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`),

				// Let's also tell the browser what's the size of the image so it can calculate aspect ratios
				width: imageDimensions.width,
				height: Math.round(imageDimensions.width / aspectRatio),
			};
		} catch (error) {
			return {};
		}
	};
}
