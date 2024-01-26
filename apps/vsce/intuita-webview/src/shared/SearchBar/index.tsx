import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import cn from 'classnames';
import styles from './style.module.css';

type Props = Readonly<{
	searchPhrase: string;
	setSearchPhrase: (searchPhrase: string) => void;
	placeholder: string;
}>;

export const SEARCH_QUERY_MIN_LENGTH = 1;

const SearchBar = (props: Props) => {
	return (
		<VSCodeTextField
			type="text"
			value={props.searchPhrase}
			placeholder={props.placeholder}
			onInput={(event) => {
				if (
					event.target === null ||
					!('value' in event.target) ||
					typeof event.target.value !== 'string'
				) {
					return;
				}

				props.setSearchPhrase(event.target.value);
			}}
			className={cn(styles.container, 'w-full')}
		>
			<span
				slot="start"
				className={cn('codicon', 'codicon-search')}
				style={{ marginInlineStart: '2px' }}
			/>
		</VSCodeTextField>
	);
};

export default SearchBar;
