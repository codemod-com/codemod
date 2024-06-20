import { BracketsCurly } from "@phosphor-icons/react";
import { Button } from "@studio/components/ui/button";
import { capitalizeWord } from "@studio/utils/string";
import type * as React from "react";

type AliasButtonsProps = {
	aliasList: string[][];
	handleInsertValue: (value: string) => void;
};

export const AliasButtons: React.FC<AliasButtonsProps> = ({
	                                                          aliasList,
	                                                          handleInsertValue,
                                                          }) => (
	<div className="flex w-full gap-1 overflow-x-auto px-1 items-center justify-content-center prompt-builders">
		{ aliasList.map(([label, value]) => (
			<Button
				variant="outline"
				size="sm"
				key={ label }
				title={ value ?? "" }
				onClick={ () => label && handleInsertValue(label) }
				className="my-0 h-8 whitespace-nowrap !py-0 text-xs"
			>
				<BracketsCurly/> &nbsp;
				{ label && capitalizeWord(label.substring(1).replace(/_/gi, " ")) }
			</Button>
		)) }
	</div>
);
