import Pane from "~/components/Panel";
import Text from "~/components/Text";
import { cn } from "~/lib/utils";

const CodemodOutputHeader = ({
	isAfterHidden,
}: { isAfterHidden?: boolean }) => (
	<Pane.Header className={cn(isAfterHidden && "border-l-2 border-b-0")}>
		<Pane.HeaderTab borderBottom={!isAfterHidden}>
			<Pane.HeaderTitle>
				<Text className="flex items-center " isTitle size="xl">
					Output
				</Text>
			</Pane.HeaderTitle>
		</Pane.HeaderTab>
	</Pane.Header>
);

export default CodemodOutputHeader;
