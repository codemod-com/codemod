import { SanityImage } from "@/components/shared/SanityImage";
import { SanityLink } from "@/components/shared/SanityLink";
import Tag from "@/components/shared/Tag";
import { CUSTOMER_STORY_TAG } from "@/constants";
import type { LinkData } from "@/types/generic.types";
import type { BlogArticleCardData } from "@/types/object.types";
import { cx } from "cva";

type BlogArticleCardProps = BlogArticleCardData & {
	variant?: "featured" | "default";
};

export default function BlogArticleCard(props: BlogArticleCardProps) {
	const link = {
		_type: "link",
		href: props.pathname,
	} as LinkData;
	const isCustomerStory = props._type === "blog.customerStory";
	const authorNames = props.authors
		?.map((author) => author?.name)
		.join(", ")
		.replace(/, ([^,]*)$/, " and $1");
	const hasMoreThan3Authors = Number(props.authors?.length) > 3;
	const renderedAuthors = hasMoreThan3Authors
		? props.authors?.slice(0, 2)
		: props.authors;

	return (
		<article className="group relative flex h-full flex-col overflow-hidden">
			{props.variant === "featured" && props.featuredImage && (
				<div className="h-40 overflow-hidden rounded-lg lg:h-60">
					<SanityLink link={link}>
						<SanityImage
							maxWidth={600}
							alt={props.featuredImage?.alt}
							image={props.featuredImage}
							elProps={{
								className:
									"h-full rounded-lg object-cover transition-transform duration-500 ease-out group-hover:scale-105",
							}}
						/>
					</SanityLink>
				</div>
			)}
			<div className="flex flex-col pt-6">
				<div className="flex gap-[0.625rem]">
					{isCustomerStory ? <Tag>{CUSTOMER_STORY_TAG.label}</Tag> : null}
					{props.tags &&
						props.tags?.slice(0, 2).map((tag, index) => (
							<Tag key={tag?.slug ?? String(index)} intent="default">
								{tag?.title}
							</Tag>
						))}
				</div>

				<SanityLink link={link}>
					<h2 className="s-heading mt-4 line-clamp-2">{props.title}</h2>
				</SanityLink>
				{props.variant === "featured" && (
					<p className="body-s mt-2 line-clamp-2">{props.preamble}</p>
				)}
				<div
					className={cx("flex items-center", {
						"justify-between": props.variant === "featured",
					})}
				>
					<div className="body-s-medium mt-6 flex items-center gap-4 font-medium">
						<ul className="authors group ml-0  flex -space-x-3">
							{renderedAuthors?.map((author, index) => (
								<li
									style={{
										zIndex: index + 1,
									}}
									key={author._key ?? String(index)}
								>
									{author.image && (
										<SanityImage
											maxWidth={100}
											alt={author.image?.alt}
											image={author.image}
											elProps={{
												className: cx(
													"rounded-md relative inline object-cover w-10 h-10  ",
													{
														"border-l border-white": index !== 0,
													},
												),
											}}
										/>
									)}
								</li>
							))}
							{hasMoreThan3Authors && (
								<li className="relative z-10 flex h-10 w-10 items-center justify-center rounded-md border-l border-white bg-primary-light dark:bg-primary-dark">
									<span className="font-medium text-primary-dark dark:text-primary-light">
										+{Number(props.authors?.length) - 2}
									</span>
								</li>
							)}
						</ul>
						<p className="authors group ml-0 flex min-w-[0px] max-w-56 flex-[1]">
							<span className="truncate">{authorNames}</span>
						</p>
					</div>
					{props.variant === "featured" ? null : (
						<span className="mt-6 block px-1 text-secondary-light dark:text-secondary-dark">
							|
						</span>
					)}
					{props.publishedAt && (
						<time
							className={cx(
								"body-s-medium mt-6 block font-medium text-secondary-light dark:text-secondary-dark",
								{
									"text-right": props.variant === "featured",
								},
							)}
						>
							{new Date(props.publishedAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</time>
					)}
				</div>
			</div>
		</article>
	);
}
