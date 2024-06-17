import publicConfig from "@/config";
import type { Metadata } from "next";
import Studio from "./Studio";

export let dynamic = "force-static";

export let metadata: Metadata = {
  title: `${publicConfig.siteName} - CMS`,
};

export default function StudioPage() {
  return <Studio />;
}
