import GradientBlob from "@/components/shared/GradientBlob";
import GradientBorderBox from "@/components/shared/GradientBorderBox";
import InfiniteSlider from "@/components/shared/InfiniteSlider";
import LinkButton from "@/components/shared/LinkButton";
import Section from "@/components/shared/Section";
import type { PageHeroProps } from "@/types/object.types";

export default function PageHero(props: PageHeroProps) {
	return (
		<Section className="relative z-0 w-full max-w-full overflow-x-clip pb-20 pt-[calc(var(--header-height)+5rem)] lg:overflow-x-visible">
			<div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full">
				<div className="pointer-events-none relative h-full w-full">
					<GradientBlob style="planet" />
					<GradientBlob style="ellipse" />
				</div>
			</div>
			<div className="relative z-20 flex flex-col items-center justify-center text-center">
				<div className="flex flex-col items-center justify-center  gap-4 lg:gap-6">
					<h1 className="xl-heading max-w-96 text-balance font-bold lg:max-w-[800px]">
						{props.title}
					</h1>
					<p className="body-l mb-10 max-w-lg lg:max-w-2xl">{props.subtitle}</p>
				</div>
				<div className="flex justify-between gap-4">
					{props.ctas?.[0] && (
						<LinkButton
							key={props.ctas[0]._key}
							intent="primary"
							arrow
							href={props.ctas[0].link}
						>
							{props.ctas[0].label}
						</LinkButton>
					)}
					{props.ctas?.[1] && (
						<LinkButton
							key={props.ctas[1]._key}
							intent="secondary"
							href={props.ctas[1].link}
							iconPosition="left"
							icon="book-open"
						>
							{props.ctas[1].label}
						</LinkButton>
					)}
				</div>
			</div>
			{props.logoCarousel?.logos?.length && (
				<div className="relative z-0">
					<GradientBorderBox
						extend={{
							corners: { tr: true, br: true, bl: true, tl: true },
							orientation: "vertical",
							extraExtension: ["top-right", "top-left"],
						}}
						className="mx-auto"
					>
						<div className="relative mt-28 max-w-6xl py-10">
							<div className=" flex flex-col items-center gap-10 lg:flex-row lg:gap-12 lg:pl-28">
								<h2 className="body-s-medium w-full max-w-[222px] text-center !font-medium lg:min-w-[220px] lg:max-w-[221px] lg:text-left">
									{props.logoCarousel.title}
								</h2>
								{props.logoCarousel?.logos && (
									<InfiniteSlider
										direction="left"
										items={props.logoCarousel?.logos}
									/>
								)}
							</div>
						</div>
					</GradientBorderBox>
				</div>
			)}
		</Section>
	);
}
