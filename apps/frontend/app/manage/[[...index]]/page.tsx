import config from "@/config";
import type { Metadata } from "next";
import Studio from "./Studio";

export let dynamic = "force-static";

export let metadata: Metadata = {
  title: `${config.siteName} - CMS`,
};

export default function StudioPage() {
  return <Studio />;
}
