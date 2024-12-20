import { useTranslation } from "react-i18next";
import { SanityImage } from "@/components/shared/SanityImage";
import { SanityLink } from "@/components/shared/SanityLink";
import type { FilterIcon } from "@/components/templates/Registry/helpers";

export const AuthorSection = ({
  author,
  authorImage,
  href,
}: { author: string; authorImage: FilterIcon; href: string }) =>  {
const { t } = useTranslation("../components/templates/CodemodPage");

return (
  <SanityLink
    className="rounded-sm focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light dark:focus-visible:ring-border-dark"
    link={{ href }}
  >
    <div className="flex items-center gap-xxs group">
      <span className="body-s-medium font-medium">{t('by')}</span>
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
      <span className="body-s-medium font-mono group-hover:opacity-50 transition-opacity">
        @{author}
      </span>
    </div>
  </SanityLink>
)
};
