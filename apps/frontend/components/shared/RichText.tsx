import { getDeepLinkId, getPtComponentId } from "@/utils/ids";
import type {
	PortableTextComponents,
	PortableTextProps,
	PortableTextTypeComponent,
} from "@portabletext/react";
import { PortableText } from "@portabletext/react";
import type {
	ArbitraryTypedObject,
	PortableTextBlock,
	PortableTextMarkDefinition,
	PortableTextSpan,
} from "@portabletext/types";
import { vercelStegaCleanAll } from "@sanity/client/stega";
import { cx } from "cva";

import { isExternalUrl } from "@/utils/urls";
import NavigationLink from "../global/Navigation/NavigationLink";
import Icon from "./Icon";
import { ptBlockComponents } from "./pt.blocks/ptBlockComponents";

function getBlockTypes(fieldName?: string) {
	return Object.fromEntries(
		Object.entries(ptBlockComponents || {}).map(([type, Component]) => [
			type,
			({ value, index }) => (
				<Component
					{...value}
					_blockIndex={index}
					rootHtmlAttributes={{
						"data-block": value._type,
						id: getDeepLinkId({ fieldName, sectionKey: value._key }),
					}}
				/>
			),
		]),
	) as Record<string, PortableTextTypeComponent>;
}

// @TODO/USER: Customize your rich text rendering styles by modifying classnames here
function createDefaultComponents(
	fieldName?: string,
	usage?: "default" | "textPage",
): PortableTextComponents {
	function prepareProps(props: PortableTextProps) {
		if (!fieldName) return {};

		return {
			id: getPtComponentId(
				props.value as PortableTextBlock<
					PortableTextMarkDefinition,
					ArbitraryTypedObject | PortableTextSpan,
					string,
					string
				>,
			),
		};
	}
	return {
		block: {
			h1: (props) => (
				<h1
					{...prepareProps(props)}
					className={cx({
						"text-3xl": usage === "default",
						"l-heading": usage === "textPage",
					})}
				>
					{props.children}
				</h1>
			),
			h2: (props) => (
				<h2
					{...prepareProps(props)}
					className={cx({
						"text-xl": usage === "default",
						"m-heading py-4": usage === "textPage",
					})}
				>
					{props.children}
				</h2>
			),
			h3: (props) => (
				<h3
					{...prepareProps(props)}
					className={cx({
						uppercase: usage === "default",
						"s-heading  py-4": usage === "textPage",
					})}
				>
					{props.children}
				</h3>
			),
			h4: (props) => (
				<h4 {...prepareProps(props)} className={cx("xs-heading py-4")}>
					{props.children}
				</h4>
			),
			h5: (props) => (
				<h4 {...prepareProps(props)} className={cx("body-l-medium py-2")}>
					{props.children}
				</h4>
			),
			normal: (props) => (
				<p
					{...prepareProps(props)}
					className={cx({
						"mb-10": usage === "default",
					})}
				>
					{props.children}
				</p>
			),
			blockquote: ({ children }) => (
				<blockquote
					className={cx({ "border-l-purple-500 pl-3": usage === "default" })}
				>
					{children}
				</blockquote>
			),
		},
		marks: {
			strong: (props) => <span className="font-bold">{props.children}</span>,
			em: (props) => <em>{props.children}</em>,
			underline: (props) => <u>{props.children}</u>,
			code: ({ children }) => <code className="inline-code">{children}</code>,
			admonition: (props) => {
				const hasIcon = !!props.value.icon.replace(/standard/i, "");

				const innerLink = (props?.children as any[])?.find(
					(c) => c?.props?.markType === "link",
				);

				const hasLink = !!innerLink;
				return (
					<span
						className={cx(
							"my-4 block rounded-lg border-l-4 border-solid  p-4",
							{
								"border-accent bg-success-light/15 dark:bg-success-dark/15":
									props.value.variant === "success" || !props.value.variant,
								"border-info-light bg-info-light/15 dark:border-info-dark dark:bg-info-dark/15":
									props.value.variant === "info",
								"border-error-light bg-error-light/15 dark:border-error-dark dark:bg-error-dark/15":
									props.value.variant === "error",
								"border-warning-light bg-warning-light/15 dark:border-warning-dark dark:bg-warning-dark/15":
									props.value.variant === "warning",
							},
						)}
					>
						<span className="mb-[10px] flex items-center">
							<Icon
								name={hasIcon ? props.value.icon : "tip"}
								className="dark:text-primary-dark"
							/>
							<span className="xs-heading  ml-2">
								{props.value.title || "Tip"}
							</span>
						</span>
						{hasLink ? (
							<NavigationLink inline {...innerLink.props.value}>
								<span
									className={cx(
										isExternalUrl(innerLink.props?.value?.href) &&
											"underline underline-offset-[3px]",
									)}
								>
									{vercelStegaCleanAll(innerLink.props.children)}
								</span>
							</NavigationLink>
						) : (
							vercelStegaCleanAll(props.children)
						)}
					</span>
				);
			},
		},
		list: {
			bullet: ({ children }) => <ul className="list-disc p-2">{children}</ul>,
			number: ({ children }) => (
				<ol className="list-decimal p-2">{children}</ol>
			),
		},

		types: getBlockTypes(fieldName),
	};
}

export const RichText = ({
	value = [],
	components: customComponents,
	fieldName,
	scrollBelowHeader,
	usage = "default",
}: PortableTextProps<PortableTextBlock | ArbitraryTypedObject> & {
	fieldName?: string;
	scrollBelowHeader?: boolean;
	usage?: "default" | "textPage";
}) => {
	const defaultComponents = createDefaultComponents(fieldName, usage);
	const components: PortableTextComponents = {
		...defaultComponents,
		...(customComponents || {}),
		marks: {
			...(customComponents?.marks || defaultComponents?.marks || {}),
			link: (props) => {
				if (!props.value) return <>{props.children}</>;

				const isExternal = isExternalUrl(props.value.href);
				return (
					<NavigationLink inline {...props.value}>
						<span
							className={cx(isExternal && "underline underline-offset-[3px]")}
						>
							{props.children}
						</span>
					</NavigationLink>
				);
			},
		},
		types: {
			...(defaultComponents?.types || {}),
			...(customComponents?.types || {}),
		},
	};

	return <PortableText value={value} components={components} />;
};
