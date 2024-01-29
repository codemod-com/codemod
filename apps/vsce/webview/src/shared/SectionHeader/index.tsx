import cn from 'classnames';
import { CSSProperties } from 'react';
import { Command } from 'vscode';
import { vscode } from '../utilities/vscode';
import s from './style.module.css';

const handleCommand = (value: Command) => {
	vscode.postMessage({
		kind: 'webview.command',
		value,
	});
};

export const SectionHeader = (
	props: Readonly<{
		title: string;
		collapsed: boolean;
		commands: ReadonlyArray<Command & { icon: string }>;
		onClick: React.MouseEventHandler<HTMLDivElement>;
		style?: CSSProperties;
	}>,
) => {
	return (
		<div
			className={s.sectionHeader}
			onClick={props.onClick}
			style={props.style}
		>
			<span
				className={cn(
					s.icon,
					'codicon',
					!props.collapsed
						? 'codicon-chevron-down'
						: 'codicon-chevron-right',
				)}
			/>
			<span className={s.title}>{props.title}</span>
			<div className={s.commands}>
				{props.commands.map((c) => {
					return (
						<span
							key={c.command}
							className={cn(
								s.icon,
								'codicon',
								`codicon-${c.icon}`,
							)}
							onClick={(e) => {
								e.stopPropagation();
								handleCommand(c);
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};
