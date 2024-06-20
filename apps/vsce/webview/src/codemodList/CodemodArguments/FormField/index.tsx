import {
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeOption,
	VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react';
import type { CodemodArgumentWithValue } from '../../../../../src/selectors/selectCodemodTree';
import styles from './style.module.css';

type Props = CodemodArgumentWithValue & {
	onChange(value: string): void;
};

let FormField = (props: Props) => {
	let { name, kind, value, description, required, onChange } = props;
	if (kind === 'string' || kind === 'number') {
		return (
			<VSCodeTextField
				placeholder={name}
				value={String(value)}
				// we need to explicitly set the type of target
				onInput={(e) =>
					onChange(
						(e as React.ChangeEvent<HTMLInputElement>).target.value,
					)
				}
				className={styles.field}
				title={description}
			>
				{name} {required && '(required)'}
			</VSCodeTextField>
		);
	}

	if (kind === 'enum') {
		return (
			<>
				<label className={styles.label}>
					{name} {required && '(required)'}
				</label>
				<VSCodeDropdown
					onChange={(e) =>
						onChange(
							(e as React.ChangeEvent<HTMLInputElement>).target
								.value,
						)
					}
					value={value}
				>
					{props.options.map((o) => (
						<VSCodeOption key={o} value={o}>
							{o}
						</VSCodeOption>
					))}
				</VSCodeDropdown>
			</>
		);
	}

	return (
		<div className={styles.fieldLayout}>
			<label className={styles.label}>
				{name} {required && '*'}
			</label>
			<VSCodeCheckbox
				title={description}
				checked={value}
				onChange={(e) => {
					onChange(
						String(
							(e as React.ChangeEvent<HTMLInputElement>).target
								.checked,
						),
					);
				}}
			/>
		</div>
	);
};

export default FormField;
