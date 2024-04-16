import LinkButton from "./LinkButton";

type CtaCardProps = {
	title: string;
	description?: string;
	ctaText: string;
	href: string;
};

export default function CtaCard(props: CtaCardProps) {
	return (
		<div className="flex flex-col items-start gap-m">
			<div className="flex flex-col items-start gap-[2px]">
				<h3 className="s-heading">{props.title}</h3>
				<p className="body-s-medium font-medium text-secondary-light dark:text-secondary-dark">
					{props.description}
				</p>
			</div>
			<LinkButton
				className="cursor-pointer shadow-sm"
				intent="primary"
				arrow
				href={props.href}
			>
				{props.ctaText}
			</LinkButton>
		</div>
	);
}
