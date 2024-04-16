import Icon from "@/components/shared/Icon";
import LinkButton from "@/components/shared/LinkButton";
import { cx } from "cva";

export default function InfoTooltip({
	className,
	content,
}: {
	className?: string;
	content?: string;
}) {
	return (
		<div className={cx("group relative ", className)}>
			{/* <img src="/icons/info.svg" alt="Info icon" /> */}
			<Icon
				name="badge-info"
				className="cursor-pointer text-primary-light dark:text-primary-dark"
			/>
			{content && (
				<div
					className={cx(
						"absolute right-0 top-[140%] !z-[9999] w-56 cursor-default rounded-md border bg-white p-2 text-left shadow-xl transition-all duration-300 2xl:left-auto 2xl:right-0 dark:border-border-dark dark:bg-background-dark",
						"pointer-events-none invisible translate-y-0 opacity-0",
						"group-hover:pointer-events-auto group-hover:visible group-hover:-translate-y-2 group-hover:opacity-100",
					)}
				>
					<p className="body-s mb-2  flex  flex-col gap-2 font-regular text-primary-light dark:text-primary-dark">
						Install cli first:
						<br />
						<code className="inline-code w-fit">pnpm i -g codemod</code>
						For details see:
					</p>
					<LinkButton
						className="w-full"
						icon="book-open"
						iconPosition="left"
						intent="secondary"
						target="_blank"
						href={"https://docs.codemod.com/introduction"}
					>
						Documentation
					</LinkButton>
				</div>
			)}
		</div>
	);
}
