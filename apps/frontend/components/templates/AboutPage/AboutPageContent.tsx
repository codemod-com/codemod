import GradientBlob from "@/components/shared/GradientBlob";
import GradientBorderBox from "@/components/shared/GradientBorderBox";
import { RichText } from "@/components/shared/RichText";
import { SanityImage } from "@/components/shared/SanityImage";
import { SanityLink } from "@/components/shared/SanityLink";
import Section from "@/components/shared/Section";
import type { BlocksBody, Investor } from "@/types";
import type { LogoDarkLight, PageHeroProps } from "@/types/object.types";
import type { SanityImageObject } from "@sanity/image-url/lib/types/types";
import { vercelStegaSplit } from "@vercel/stega";
import { cx } from "cva";
import React from "react";
import type { AboutPageProps } from "./Page";

export default function AboutPageSections({ data }: AboutPageProps) {
	return (
		<div className="w-full">
			{/* Hero */}
			<div className="relative overflow-x-clip px-xl py-[80px] pt-[calc(var(--header-height)+5rem)] lg:overflow-x-visible lg:px-[80px]">
				<div className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-full">
					<div className="pointer-events-none relative h-full w-full">
						<GradientBlob style="planet" />
						<GradientBlob style="ellipse" />
					</div>
				</div>
				<div className="relative z-20 flex flex-col items-center justify-center text-center">
					<div className="flex flex-col items-center justify-center">
						<h1 className="xl-heading max-w-96 font-bold lg:max-w-[800px]">
							{data?.hero?.title}
						</h1>
						{data?.hero?.subtitle && (
							<p className="body-l mb-10 mt-4 max-w-lg lg:mt-6 lg:max-w-2xl">
								{data?.hero?.subtitle}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Our story */}
			<ParagraphWithTitle
				title={data?.paragraphTitle}
				content={data?.paragraphContent}
			/>

			{/* Team */}
			<TeamGrid title={data?.teamTitle} teamMembers={data?.teamMembers} />

			{/* Companies */}
			<Companies companies={data?.companies} />

			{/* Investors */}
			<Investors
				investorsTitle={data?.investorsTitle}
				investorsSubtitle={data?.investorsSubtitle}
				investors={data?.investors}
			/>
		</div>
	);
}

type PargraphProps = {
	title: string;
	content: BlocksBody;
};

function ParagraphWithTitle(props: PargraphProps) {
	const getSides = () => {
		return {
			right: false,
			left: false,
			bottom: false,
			top: true,
		};
	};

	return (
		<Section className="w-full py-2xl">
			<GradientBorderBox
				className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-m pt-2xl"
				sides={getSides()}
				dots={{
					tl: false,
					tr: false,
					bl: false,
					br: false,
				}}
			>
				<h2 className="m-heading text-center">{props.title}</h2>
				<div className="body-l max-w-[480px] text-balance text-center">
					<RichText value={props.content} />
				</div>
			</GradientBorderBox>
		</Section>
	);
}

type GridProps = {
	title: string;
	teamMembers: TeamMemberProps[];
};

function TeamGrid(props: GridProps) {
	return (
		<Section className="w-full py-2xl lg:py-[80px]">
			<div className="flex flex-col gap-l">
				<h2 className="l-heading text-center">{props.title}</h2>
				<div className="grid grid-cols-2 gap-0 lg:grid-cols-4 lg:gap-x-0 lg:gap-y-xs">
					{props.teamMembers.map((member) => (
						<TeamMemberGridItem key={member.name} {...member} />
					))}
				</div>
			</div>
		</Section>
	);
}

type TeamMemberProps = {
	image?: SanityImageObject & { alt?: string };
	name?: string;
	role?: string;
	linkedin?: string;
	twitter?: string;
	bio?: BlocksBody;
	previousCompany?: string;
	previousCompanyLogo?: LogoDarkLight;
};

function TeamMemberGridItem(props: TeamMemberProps) {
	const getSides = () => {
		return {
			right: false,
			left: false,
			bottom: true,
			top: false,
		};
	};

	const { cleaned: previousCompany } = vercelStegaSplit(
		props.previousCompany || "",
	);

	return (
		<div className="flex flex-col p-s lg:p-m ">
			<div className="flex h-full flex-col">
				<div className="max-h-[212px] max-w-[212px] bg-emphasis-light lg:h-[212px] lg:w-[212px] dark:bg-emphasis-dark">
					{props.image ? (
						<SanityImage
							maxWidth={212}
							image={props.image}
							alt={props.image?.alt}
							elProps={{
								className: "rounded-[4px]",
							}}
						/>
					) : (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src="/static/img-placeholder.svg"
							className="h-full w-full rounded-s bg-secondary-light dark:bg-secondary-dark"
							alt="Placeholder image"
						/>
					)}
				</div>
				<GradientBorderBox
					className="body-l-medium w-full max-w-none py-s font-medium"
					sides={getSides()}
					dots={{
						tl: false,
						tr: false,
						bl: false,
						br: false,
					}}
				>
					<span>{props.name}</span>
					<span className="block text-secondary-light dark:text-secondary-dark">
						{props.role}
					</span>
				</GradientBorderBox>
				<div className="flex items-center gap-s py-s">
					<a href={props.linkedin}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/logotypes/light/linkedin.svg"
							alt="Linkedin logo"
							className="dark:hidden"
						/>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/logotypes/dark/linkedin.svg"
							alt="Linkedin logo"
							className="hidden dark:block"
						/>
					</a>
					<a href={props.twitter}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/logotypes/light/x.svg"
							alt="X/Twitter logo"
							className="dark:hidden"
						/>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/logotypes/dark/x.svg"
							alt="X/Twitter logo"
							className="hidden dark:block"
						/>
					</a>
				</div>

				<div className="body-s-medium mb-6 font-medium">
					{props.bio && <RichText value={props.bio} />}
				</div>

				<div className="mt-auto flex items-center gap-xs justify-self-end">
					{props.previousCompanyLogo?.darkModeImage?.asset && (
						<span className="body-s-medium hidden font-medium dark:block">
							Previously:
						</span>
					)}
					{props.previousCompanyLogo?.lightModeImage?.asset && (
						<span className="body-s-medium font-medium dark:hidden">
							Previously:
						</span>
					)}

					{/* eslint-disable-next-line @next/next/no-img-element */}
					{props.previousCompanyLogo?.lightModeImage && (
						<SanityImage
							maxWidth={100}
							image={props.previousCompanyLogo?.lightModeImage}
							alt={previousCompany}
							elProps={{
								className:
									"max-h-[16px] w-auto max-w-[100px] dark:hidden object-contain",
							}}
						/>
					)}
					{props.previousCompanyLogo?.darkModeImage && (
						<SanityImage
							maxWidth={100}
							image={props.previousCompanyLogo?.darkModeImage}
							alt={previousCompany}
							elProps={{
								className:
									"max-h-[16px] w-auto max-w-[100px] hidden dark:block object-contain",
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

type CompaniesProps = {
	companies: PageHeroProps;
};

function Companies(props: CompaniesProps) {
	return (
		<Section className="relative z-0 w-full max-w-full overflow-x-clip py-2xl lg:py-20">
			<div className="relative z-20 flex flex-col items-center justify-center text-center">
				<div className="flex flex-col items-center justify-center gap-4">
					<h2 className="l-heading max-w-96 text-balance font-bold lg:max-w-[800px]">
						{props.companies.title}
					</h2>
					<p className="body-l mb-10 max-w-lg lg:max-w-2xl">
						{props.companies.subtitle}
					</p>
				</div>
			</div>
			{props.companies.logoCarousel?.logos?.length && (
				<div className="relative z-0 mt-2xl w-full">
					<GradientBorderBox
						extend={{
							corners: { tr: true, br: true, bl: true, tl: true },
							orientation: "vertical",
							extraExtension: ["top-right", "top-left"],
						}}
						className="mx-auto max-w-full"
					>
						<div className="relative w-full max-w-6xl px-[21px] py-[48px] lg:px-[70px] lg:py-[70px]">
							<div
								className={cx(
									"grid grid-cols-2 place-items-center gap-y-20",
									props.companies.logoCarousel.logos?.length === 3 &&
										"lg:grid-cols-3",
									props.companies.logoCarousel.logos?.length === 4 &&
										"lg:grid-cols-4",
									props.companies.logoCarousel.logos?.length === 5 &&
										"lg:grid-cols-5",
									props.companies.logoCarousel.logos?.length >= 6 &&
										"lg:grid-cols-3",
								)}
							>
								{props.companies.logoCarousel.logos?.map(
									(item, index, array) => {
										const isLastAndOdd =
											index === array.length - 1 && (index + 1) % 2 !== 0;

										return (
											<div
												key={`${item.link}-${index}`}
												className={cx(
													"flex w-24 items-center",
													isLastAndOdd && "col-span-2 lg:col-span-1",
												)}
											>
												<SanityLink link={{ href: item?.link, _type: "link" }}>
													{item?.lightModeImage && (
														<SanityImage
															maxWidth={400}
															image={item?.lightModeImage}
															elProps={{
																alt: item?.lightModeImage?.alt,
																className: "w-full object-cover dark:hidden",
															}}
														/>
													)}
													{item?.darkModeImage && (
														<SanityImage
															maxWidth={400}
															image={item?.darkModeImage}
															elProps={{
																alt: item?.darkModeImage?.alt,
																className:
																	"w-full object-cover hidden dark:block",
															}}
														/>
													)}
												</SanityLink>
											</div>
										);
									},
								)}
							</div>
						</div>
					</GradientBorderBox>
				</div>
			)}
		</Section>
	);
}

type InvestorsProps = {
	investorsTitle: string;
	investorsSubtitle: BlocksBody;
	investors: Investor[];
};

function Investors(props: InvestorsProps) {
	return (
		<Section className="relative flex w-full flex-col gap-l py-2xl lg:py-[80px]">
			<div className="flex flex-col gap-s">
				<h2 className="l-heading">{props.investorsTitle}</h2>
				<div className="body-l max-w-[750px] text-balance">
					<RichText value={props.investorsSubtitle} />
				</div>
			</div>

			<div className="z-20 grid grid-cols-2 gap-x-xs gap-y-xs lg:grid-cols-4 lg:gap-xs lg:gap-y-m">
				{props.investors.map((investor) => (
					<InvestorGridItem key={investor.name} {...investor} />
				))}
			</div>

			<div className="pointer-events-none absolute left-10 top-[100%] z-10 lg:top-1/3">
				<GradientBlob style="ellipse" />
			</div>
		</Section>
	);
}

function InvestorGridItem(props: Investor) {
	// const { cleaned: company } = vercelStegaSplit(props.company);

	return (
		<div className="flex flex-col gap-s py-6 lg:flex-row">
			<div className="h-16 w-16">
				<SanityImage
					maxWidth={64}
					image={props.image}
					alt={props.image?.alt}
					elProps={{
						className: "h-16 w-16 object-cover object-top rounded-[4px]",
					}}
				/>
			</div>
			<div className="flex flex-col items-start gap-s">
				<div>
					<h3 className="body-l-medium font-medium">{props.name}</h3>
					<span className="body-l-medium block font-medium text-secondary-light dark:text-secondary-dark">
						{props.role}
					</span>
				</div>
				<div className="hidden dark:block">
					{props.companyLogo?.darkModeImage && (
						<SanityImage
							image={props.companyLogo?.darkModeImage}
							alt={props.companyLogo?.darkModeImage?.alt}
							maxWidth={100}
							elProps={{
								className: "h-[26px] ",
							}}
						/>
					)}
				</div>
				<div className="dark:hidden">
					{props.companyLogo?.lightModeImage && (
						<SanityImage
							image={props.companyLogo?.lightModeImage}
							alt={props.companyLogo?.lightModeImage?.alt}
							maxWidth={100}
							elProps={{
								className: "h-[26px] ",
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
