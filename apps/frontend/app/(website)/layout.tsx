import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { draftMode, headers } from "next/headers";

import { metadata } from "@/app/(website)/studio/StudioLayout";
import GlobalLayout from "@/components/global/GlobalLayout";
import GlobalLayoutPreview from "@/components/global/GlobalLayoutPreview";
import publicConfig from "@/config";
import { loadGlobalData } from "@/data/sanity";
import { GLOBAL_QUERY } from "@/data/sanity/queries";
import { getOgImages } from "@/data/sanity/resolveSanityRouteMetadata";

const LiveVisualEditing = dynamic(
  () => import("@/components/LiveVisualEditing"),
);

/**
 * credits: https://github.com/vercel/next.js/discussions/50189#discussioncomment-9224262
 *
 * Get the pathname from the metadata state
 * This dives into async storage of promise state to get the pathname
 *
 * This is much more performant that using headers() from next as this doesn't opt out from the cache
 * @param state
 */
// @ts-ignore
const getPathnameFromMetadataState = (state: any): string => {
  const res = Object.getOwnPropertySymbols(state || {})
    .map((p) => state[p])
    .filter(Boolean)
    .find((state) =>
      Object.prototype.hasOwnProperty.call(state, "urlPathname"),
    );

  return res?.urlPathname.replace(/\?.+/, "") ?? "";
};
// @ts-ignore
export async function generateMetadata(_: any, state: any): Promise<Metadata> {
  const pathname = getPathnameFromMetadataState(state);

  if (pathname.includes("/studio")) {
    return metadata;
  }
  const { data } = await loadGlobalData(GLOBAL_QUERY);

  return {
    title: publicConfig.siteName,
    openGraph: {
      title: publicConfig.siteName,
      images: !data?.fallbackOGImage
        ? undefined
        : getOgImages(data.fallbackOGImage),
    },
  };
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalData = await loadGlobalData(GLOBAL_QUERY);

  return (
    <>
      {globalData.data &&
        (draftMode().isEnabled ? (
          <GlobalLayoutPreview data={globalData.data}>
            {children}
          </GlobalLayoutPreview>
        ) : (
          <GlobalLayout data={globalData.data}>{children}</GlobalLayout>
        ))}
      {draftMode().isEnabled && <LiveVisualEditing />}
    </>
  );
}
