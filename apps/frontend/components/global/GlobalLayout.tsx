import type { GlobalPagePayload } from "@/types";
import Footer from "./Footer";
import Navigation from "./Navigation";

export default function GlobalLayout({
	data,
	children,
}: {
	data: GlobalPagePayload;
	children: any;
}) {
	return (
		<div className="flex min-h-svh w-full flex-col items-center justify-between">
			<Navigation data={data.navigation} />
			<main className="w-full max-w-[1312px]">{children}</main>
			<Footer data={data.footer} />
		</div>
	);
}
