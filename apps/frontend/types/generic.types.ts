import type { SanityImageObject } from "@sanity/image-url/lib/types/types";

export type ImageWithAltFieldObject = SanityImageObject & {
  alt?: string;
};

export type LinkData = {
  _type: "link";
  href: string;
};

export type CTAData = {
  label?: string;
  link?: string;
};
