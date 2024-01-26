import React from 'react';
import { ReactComponent as ArrowDownIcon } from '../../assets/arrow-down.svg';
import './Collapsable.css';
import cn from 'classnames';

type CollapsableProps = Readonly<{
	defaultExpanded: boolean;
	headerComponent: React.ReactNode;
	headerClassName?: string;
	headerChevronClassName?: string;
	headerSticky?: boolean;
	children: React.ReactNode;
	contentClassName?: string;
	className?: string;
	onToggle?: (expanded: boolean) => void;
}>;

export const Collapsable = ({
	onToggle,
	defaultExpanded: defaultCollapsed,
	headerSticky,
	headerComponent,
	headerClassName,
	headerChevronClassName,
	contentClassName,
	className,
	children,
}: CollapsableProps) => {
	return (
		<div className={cn('collapsable', className)}>
			<div
				className={cn(headerClassName, {
					collapsable__header: true,
					'collapsable__header--sticky': headerSticky,
				})}
				onClick={() => onToggle?.(!defaultCollapsed)}
			>
				{onToggle && (
					<ArrowDownIcon
						className={cn(
							'collapsable__arrow',
							headerChevronClassName,
							{
								'collapsable__arrow--collapsed':
									!defaultCollapsed,
							},
						)}
					/>
				)}
				{headerComponent}
			</div>
			{defaultCollapsed && (
				<div className={cn('collapsable_content', contentClassName)}>
					{children}
				</div>
			)}
		</div>
	);
};
