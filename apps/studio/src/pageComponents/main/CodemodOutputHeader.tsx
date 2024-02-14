import Pane from '~/components/Panel';
import Text from '~/components/Text';
import LiveIcon from './LiveIcon';

const CodemodOutputHeader = () => (
	<Pane.Header>
		<Pane.HeaderTab>
			<Pane.HeaderTitle>
				<Text className="flex items-center " isTitle size="xl">
					<LiveIcon />
					Codemod Output
				</Text>
			</Pane.HeaderTitle>
		</Pane.HeaderTab>
	</Pane.Header>
);

export default CodemodOutputHeader;
