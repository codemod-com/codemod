import { SanityImage } from "@/components/shared/SanityImage";
import type { FilterIcon } from "@/components/templates/Registry/helpers";
import Link from "next/link";

export let AuthorSection = ({
  author,
  authorImage,
  href,
}: { author: string; authorImage: FilterIcon; href: string }) => (
  <Link
    href={href}
    className="rounded-sm focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light dark:focus-visible:ring-border-dark"
    prefetch
  >
    <div className="flex items-center gap-xs">
      <span className="body-s-medium font-medium">by</span>

      <>
        {authorImage?.image.light && (
          <SanityImage
            maxWidth={20}
            image={authorImage.image.light}
            alt={authorImage.image.light.alt}
            elProps={{
              width: 20,
              height: 20,
              className: "h-5 w-5 dark:hidden",
            }}
          />
        )}

        {authorImage?.image.dark && (
          <SanityImage
            maxWidth={20}
            image={authorImage.image.dark}
            alt={authorImage.image.dark.alt}
            elProps={{
              width: 20,
              height: 20,
              className: "hidden h-5 w-5 dark:inline",
            }}
          />
        )}
      </>
      <span className="body-s-medium font-medium">{author}</span>
    </div>
  </Link>
);
