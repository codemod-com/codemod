import { HeaderProps } from "./types";

import Pane from "~/components/Panel";
import { VisibilityIcon } from "~/icons/VisibilityIcon";

export const SnippetHeader = ({
	isCollapsed = false,
	ondblclick = console.log,
	title,
	visibilityOptions,
}: HeaderProps) => (
	<Pane.Header>
		{isCollapsed && (
			<Pane.HeaderTab ondblclick={ondblclick}>
				<Pane.HeaderTitle>{title}</Pane.HeaderTitle>
			</Pane.HeaderTab>
		)}
		<Pane.HeaderTab active={isCollapsed}>
			{visibilityOptions && (
				<VisibilityIcon visibilityOptions={visibilityOptions} />
			)}
			<Pane.HeaderTitle>{title}</Pane.HeaderTitle>
		</Pane.HeaderTab>
	</Pane.Header>
);
