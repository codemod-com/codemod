"use client";
import { Media, MediaContextProvider } from "@/components/global/Media";
import type { RegistryIndexPayload } from "@/types";
import DesktopFilters from "./DesktopFilters";
import MobileFilterComponent from "./MobileFilterComponent";

export default function RegistryFilters({
	placeholders,
	automationFilters,
	filterIconDictionary,
}: RegistryIndexPayload) {
	return (
		<MediaContextProvider>
			<Media lessThan="lg">
				<MobileFilterComponent
					placeholders={placeholders}
					automationFilters={automationFilters}
					filterIconDictionary={filterIconDictionary}
				/>
			</Media>
			<Media
				style={{
					alignSelf: "start",
				}}
				className="sticky top-10"
				greaterThanOrEqual="lg"
			>
				<DesktopFilters
					placeholders={placeholders}
					automationFilters={automationFilters}
					filterIconDictionary={filterIconDictionary}
				/>
			</Media>
		</MediaContextProvider>
	);
}
