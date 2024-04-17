import GradientBorderBox from "@/components/shared/GradientBorderBox";
import LinkButton from "@/components/shared/LinkButton";
import NewsletterForm from "@/components/shared/NewsletterForm";
import { RichText } from "@/components/shared/RichText";
import Section from "@/components/shared/Section";
import {
	type PageCta,
	type PageCtaDouble,
	PageCtaTriple,
} from "@/types/object.types";
import { cx } from "cva";

type PageCtaProps = PageCta | PageCtaDouble | PageCtaTriple;

export default function PageCta(props: PageCtaProps) {
	switch (props._type) {
		case "pageCta":
			return <SimplePageCta {...props} />;
		case "pageCtaDouble":
			return <PageCTADouble {...props} />;
		case "pageCtaTriple":
			return <PageCtaTriple {...props} />;
		default:
			return null;
	}
}

function SimplePageCta(props: PageCta) {
	return (
		<Section className="relative z-10 w-full py-[80px]">
			<GradientBorderBox className="w-full max-w-none">
				<div className="flex w-full flex-col items-start gap-4 bg-white/60 px-m py-2xl lg:px-[128px] lg:py-[86px] dark:bg-background-dark/40">
					<h2 className="l-heading">{props.title}</h2>
					<div className="body-l max-w-[540px]">
						<RichText value={props.paragraph} />
					</div>
					{props.cta && props.cta.icon && props.cta.icon === "standard" ? (
						<LinkButton
							href={props.cta.link}
							intent={props.cta.style}
							arrow
							className="mt-xl"
						>
							{props.cta.label}
						</LinkButton>
					) : null}
					{props.cta && props.cta.icon && props.cta.icon !== "standard" ? (
						<LinkButton
							href={props.cta.link}
							intent={props.cta.style}
							icon={props.cta.icon}
							iconPosition="right"
							className="mt-xl"
						>
							{props.cta.label}
						</LinkButton>
					) : null}
				</div>
			</GradientBorderBox>
		</Section>
	);
}

function PageCTADouble(props: PageCtaDouble) {
	return (
		<Section className="flex w-full flex-col lg:flex-row lg:pb-[100px]">
			{/* Left */}
			<GradientBorderBox
				className="block w-full max-w-none px-m lg:hidden  lg:px-0 lg:pb-10"
				extend={{
					orientation: "vertical",
					corners: {
						tl: false,
						tr: true,
						bl: false,
						br: false,
					},
				}}
				sides={{
					top: false,
					bottom: true,
					left: false,
					right: false,
				}}
				dots={{
					tl: false,
					tr: false,
					bl: false,
					br: false,
				}}
			>
				<PageCtaDoubleBlock {...props} position="left" />
			</GradientBorderBox>

			<GradientBorderBox
				className="hidden w-full max-w-none px-m lg:block lg:px-0 lg:pb-10"
				extend={{
					orientation: "vertical",
					corners: {
						tl: false,
						tr: true,
						bl: false,
						br: false,
					},
				}}
				sides={{
					top: false,
					bottom: false,
					left: false,
					right: true,
				}}
				dots={{
					tl: false,
					tr: true,
					bl: false,
					br: true,
				}}
			>
				<PageCtaDoubleBlock {...props} position="left" />
			</GradientBorderBox>
			{/* Right */}
			<GradientBorderBox
				className="w-full max-w-none px-m lg:px-0 lg:pb-10"
				sides={{
					top: false,
					bottom: false,
					left: false,
					right: false,
				}}
				dots={{
					tl: false,
					tr: false,
					bl: false,
					br: false,
				}}
			>
				{props.rightSectionIsNewsletter ? (
					<NewsletterForm {...props} />
				) : (
					<PageCtaDoubleBlock {...props} position="right" />
				)}
			</GradientBorderBox>
		</Section>
	);
}

function PageCtaDoubleBlock(
	props: PageCtaDouble & { position: "left" | "right" },
) {
	const title =
		props.position === "left"
			? props.leftSectionTitle
			: props.rightSectionTitle;
	const paragraph =
		props.position === "left"
			? props.leftSectionParagraph
			: props.rightSectionParagraph;
	const cta =
		props.position === "left" ? props.leftSectionCta : props.rightSectionCta;

	return (
		<div className="flex flex-col items-start py-[80px] lg:px-[52px] lg:pt-[140px]">
			<h2 className="m-heading text-balance">{title}</h2>
			{paragraph ? (
				<div className="body-l mt-4 max-w-[540px]">
					<RichText value={paragraph} />
				</div>
			) : null}
			{cta && cta.icon && cta.icon === "standard" ? (
				<LinkButton intent={cta.style} arrow className="mt-xl" href={cta.link}>
					{cta.label}
				</LinkButton>
			) : null}
			{cta && cta.icon && cta.icon !== "standard" ? (
				<LinkButton
					intent={cta.style}
					icon={cta.icon}
					iconPosition="right"
					className="mt-xl"
					href={cta.link}
				>
					{cta.label}
				</LinkButton>
			) : null}
		</div>
	);
}

function PageCtaTriple(props: PageCtaTriple) {
	const titleLine1 = props.splitPattern
		? props.title.split(props.splitPattern)[0] + props.splitPattern
		: props.title;
	const titleLine2 = props.splitPattern
		? props.title.split(props.splitPattern)[1]
		: "";
	return (
		<Section className="w-full py-[40px] lg:py-[80px]">
			<GradientBorderBox
				className="w-full max-w-none"
				sides={{
					top: true,
					bottom: false,
					left: false,
					right: false,
				}}
				dots={{
					tl: false,
					tr: false,
					bl: false,
					br: false,
				}}
			>
				<div className="adsadasd flex w-full flex-col gap-10 py-[40px] lg:items-center lg:gap-[60px] lg:py-[86px]">
					<div className="flex flex-col gap-6 lg:px-[128px]">
						<h2 className="l-heading lg:text-center">
							{titleLine1}
							{titleLine2 && (
								<span className="block font-bold">{titleLine2}</span>
							)}
						</h2>
						<div className="body-l max-w-[540px] lg:text-center">
							<RichText value={props.paragraph} />
						</div>
					</div>
					<div className="flex w-full flex-col items-start justify-between gap-xl lg:flex-row lg:gap-xl">
						{props.ctas.map((cta, index) => {
							return (
								<div
									key={cta.title}
									className={cx(
										"flex flex-1 flex-col gap-[8px] lg:items-center lg:gap-m lg:text-center",
									)}
								>
									<h3 className="s-heading font-bold">{cta.title}</h3>
									{cta?.icon ? (
										cta?.icon === "standard" ? (
											<LinkButton
												intent={cta.style}
												key={cta.title}
												arrow
												className="w-fit"
												href={cta.link}
											>
												{cta.label}
											</LinkButton>
										) : (
											<LinkButton
												intent={cta.style}
												icon={cta.icon}
												iconPosition="left"
												key={cta.title}
												className="w-fit"
												href={cta.link}
											>
												{cta.label}
											</LinkButton>
										)
									) : null}
								</div>
							);
						})}
					</div>
				</div>
			</GradientBorderBox>
		</Section>
	);
}
