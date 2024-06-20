import {
	VSCodeOption,
	VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react';
import cn from 'classnames';
import type React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';
import styles from './style.module.css';

type Props = {
	initialValue: string;
	autocompleteItems: ReadonlyArray<string>;
	onChange: (value: string) => void;
};

let AUTOCOMPLETE_OPTIONS_LENGTH = 20;

let getFilteredOptions = (allOptions: ReadonlyArray<string>, value: string) => {
	// ignores slashes at the beginning, ignores whitespace
	let trimmedLowerCaseValue = value
		.replace(/^[/\\]+/, '')
		.trim()
		.toLocaleLowerCase();

	return allOptions
		.filter((i) => i.toLocaleLowerCase().startsWith(trimmedLowerCaseValue))
		.slice(0, AUTOCOMPLETE_OPTIONS_LENGTH);
};
export let DirectorySelector = ({
	initialValue,
	onChange,
	autocompleteItems,
}: Props) => {
	let [value, setValue] = useState(initialValue);
	let [focusedOptionIdx, setFocusedOptionIdx] = useState<number | null>(null);
	let [showOptions, setShowOptions] = useState(false);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	let autocompleteOptions = getFilteredOptions(autocompleteItems, value);

	let handleChange = (e: Event | React.FormEvent<HTMLElement>) => {
		setValue((e.target as HTMLInputElement)?.value);
	};

	let handleFocus = () => {
		setFocusedOptionIdx(-1);
		setShowOptions(true);
	};

	let handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
		let maxLength = autocompleteOptions.length;

		if (e.key === 'Esc') {
			setFocusedOptionIdx(0);
			setShowOptions(false);
		}

		if (e.key === 'Enter') {
			setShowOptions(false);
			if (focusedOptionIdx === null || focusedOptionIdx < 0) {
				return;
			}

			let nextValue = autocompleteOptions[focusedOptionIdx] ?? '';

			onChange(nextValue);
			setValue(nextValue);
		}

		if (e.key === 'ArrowUp') {
			let nextValue =
				focusedOptionIdx === null
					? maxLength
					: (focusedOptionIdx - 1 + maxLength) % maxLength;
			setFocusedOptionIdx(nextValue);
			e.stopPropagation();
			e.preventDefault();
		}

		if (e.key === 'ArrowDown') {
			let nextValue =
				focusedOptionIdx === null
					? 0
					: (focusedOptionIdx + 1) % maxLength;

			setFocusedOptionIdx(nextValue);
			e.stopPropagation();
			e.preventDefault();
		}

		if (e.key === 'Tab') {
			let nextValue =
				focusedOptionIdx === null
					? 0
					: (focusedOptionIdx + 1) % maxLength;
			setFocusedOptionIdx(nextValue);
			e.stopPropagation();
			e.preventDefault();
		}
	};

	useLayoutEffect(() => {
		document.getElementById(`option_${focusedOptionIdx}`)?.focus();
	}, [focusedOptionIdx]);

	return (
		<div
			className="flex flex-row justify-between align-items-center"
			style={{
				width: '100%',
			}}
			onKeyDown={handleKeyDown}
		>
			<div className="flex flex-col w-full overflow-hidden relative">
				<VSCodeTextField
					id="directory-selector"
					className={cn(styles.textField)}
					value={value}
					onInput={handleChange}
					onFocus={handleFocus}
				>
					--target
				</VSCodeTextField>
				<div className={styles.autocompleteItems}>
					{showOptions &&
						autocompleteOptions.map((item, i) => (
							<VSCodeOption
								tabIndex={0}
								id={`option_${i}`}
								className={styles.option}
								onClick={() => {
									setShowOptions(false);
									setValue(item);
									onChange(item);
								}}
							>
								{item}
							</VSCodeOption>
						))}
				</div>
			</div>
		</div>
	);
};
