import config from "@/config";
import type { Metadata } from "next";
import Studio from "./Studio";

export const dynamic = "force-static";

export const metadata: Metadata = {
	title: `${config.siteName} - CMS`,
};

export default function StudioPage() {
	return <Studio />;
}
