import { SanityImage } from "@/components/shared/SanityImage";
import Section from "@/components/shared/Section";
import Tabs, { TabContent } from "@/components/shared/Tabs";
import Video from "@/components/shared/Video";
import type { SanityImageWithAltField } from "@/types/object.types";
import type { SectionFullWidthMediaProps } from "@/types/section.types";
export default function SectionFullWidthMedia(
	props: SectionFullWidthMediaProps,
) {
	if (!props.mediaTabs) return null;
	return (
		<Section className="py-20">
			<div className="container">
				<div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
					{props.title && (
						<h2 className="l-heading font-bold">{props.title}</h2>
					)}
					{props.subtitle && (
						<p className="body-l max-w-2xl">{props.subtitle}</p>
					)}
				</div>
				<div className="mt-10">
					<Tabs
						items={props.mediaTabs.map((item) => ({
							id: item._key,
							label: item.tabTitle || "",
						}))}
						listClassName="mx-auto mb-4"
					>
						{props.mediaTabs.map((item) => {
							return (
								<TabContent key={item._key} forId={item._key}>
									<div className="aspect-video overflow-hidden rounded-lg">
										{item?.mediaItem?.[0] &&
											(item?.mediaItem?.[0] as any)?._type === "muxVideo" && (
												// @ts-ignore
												<Video {...item.mediaItem?.[0]} />
											)}

										{(item?.mediaItem?.[0] as any)?._type ===
											"imageWithAltField" && (
											<SanityImage
												image={item.mediaItem?.[0] as SanityImageWithAltField}
												maxWidth={1440}
											/>
										)}
									</div>
								</TabContent>
							);
						})}
					</Tabs>
				</div>
			</div>
		</Section>
	);
}
