"use client";
import LinkButton from "@/components/shared/LinkButton";
import { SanityImage } from "@/components/shared/SanityImage";
import Tag from "@/components/shared/Tag";
import { useFetchAutomations } from "@/hooks/useFetchAutomations";
import type { SectionRegistryProps } from "@/types/section.types";
import { capitalize } from "@/utils/strings";
import { useRef, useState } from "react";
import { useDebounce } from "react-use";
import RegistrySectionCard from "./RegistrySectionCard";
import RegistrySectionSearch from "./RegistrySectionSearch";
import { getFilterIcon, getFilterSection } from "./helpers";

export default function RegistrySectionInner(props: SectionRegistryProps) {
	const [searchParams, setSearchParams] = useState(new URLSearchParams());
	const isMounted = useRef(false);
	function handleFilterChange(key?: string, value?: string) {
		if (!key) return;
		const newParams = new URLSearchParams(searchParams);
		if (!value || value === searchParams.get(key)) {
			newParams.delete(key);
		} else {
			newParams.set(key, value);
		}
		setSearchParams(newParams);
	}
	const { data, fetchAutomations } = useFetchAutomations({
		initial: props.initialAutomations,
	});
	useDebounce(
		async () => {
			if (!isMounted.current) {
				isMounted.current = true;
				if (!props.initialAutomations) {
					await fetchAutomations(searchParams);
				}
				return;
			}
			await fetchAutomations(searchParams);
		},
		250,
		[searchParams],
	);

	return (
		<div className="scrollbar-color w-full">
			<div className="mx-auto mt-8 max-w-[662px]">
				<RegistrySectionSearch
					onSearch={handleFilterChange}
					placeholder={props.searchPlaceholder}
				/>
				<div className="mt-4 w-full overflow-scroll lg:overflow-clip">
					<ul className="m-0 flex justify-start gap-2 md:justify-center">
						{props.filter?.values?.slice(0, 5).map((filter) => {
							const frameworkIcons = getFilterSection(
								"framework",
								props.filterIconDictionary,
							);
							const frameworkImage = getFilterIcon(frameworkIcons, filter.id);

							return (
								<li key={filter.id} className="min-w-fit">
									<button
										onClick={() => handleFilterChange("framework", filter.id)}
									>
										<Tag
											intent={
												searchParams.get("framework") === filter.id
													? "primary"
													: "default"
											}
										>
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
											<span>{capitalize(filter.id || "")}</span>
										</Tag>
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			</div>

			<div className="relative flex flex-col items-center">
				<ul className="m-0 mx-auto flex w-full max-w-[962px] animate-fade-in flex-col gap-3 divide-y-[1px] divide-border-light dark:divide-border-dark">
					{!!data?.data?.length ? (
						data?.data?.map((entry) => (
							<RegistrySectionCard
								filterIconDictionary={props.filterIconDictionary}
								onFilter={handleFilterChange}
								{...entry}
								verifiedTooltip={props.verifiedAutomationTooltip}
								key={entry.id}
							/>
						))
					) : (
						<div className="flex w-full justify-center py-20">
							<h5 className="body-m">{"No automations found"}</h5>
						</div>
					)}
				</ul>
				<div className="pointer-events-none absolute bottom-0 z-10 h-1/4 w-full bg-gradient-to-t from-white dark:from-background-dark"></div>
				<LinkButton intent="primary" className="z-20" href={`/registry`} arrow>
					{props.ctaLabel || "View all automations"}
				</LinkButton>
			</div>
		</div>
	);
}
