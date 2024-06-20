import { SanityImage } from "@/components/shared/SanityImage";
import Tag from "@/components/shared/Tag";
import type { FilterIcon } from "@/components/templates/Registry/helpers";
import { REGISTRY_FILTER_TYPES } from "@/constants";
import { capitalize } from "@utils/strings";
import Link from "next/link";

export let getFrameworkCard = ({
  name: framework,
  image: frameworkImage,
}: { name: string; image: FilterIcon }) => (
  <Link
    key={framework}
    href={`/registry?${
      REGISTRY_FILTER_TYPES.framework
    }=${framework.toLowerCase()}`}
    prefetch
  >
    <Tag intent="default">
      <>
        {frameworkImage?.image.light && (
          <SanityImage
            maxWidth={20}
            image={frameworkImage.image.light}
            alt={frameworkImage.image.light.alt}
            elProps={{
              width: 20,
              height: 20,
              className: "h-5 w-5 dark:hidden",
            }}
          />
        )}

        {frameworkImage?.image.dark && (
          <SanityImage
            maxWidth={20}
            image={frameworkImage.image.dark}
            alt={frameworkImage.image.dark.alt}
            elProps={{
              width: 20,
              height: 20,
              className: "hidden h-5 w-5 dark:inline",
            }}
          />
        )}
      </>

      <span className="capitalize">{capitalize(framework)}</span>
    </Tag>
  </Link>
);
