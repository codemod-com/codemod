import React, { useEffect } from "react";
import { type StringInputProps, set, unset, useFormValue } from "sanity";

import { useFetchAutomations } from "@/hooks/useFetchAutomations";
import { Card, Select, Spinner, Text } from "@sanity/ui";

const cardProps = { shadow: 1, padding: 3, radius: 2 };

export default function FilterIconPicker(props: StringInputProps) {
	const { onChange, value } = props;

	const { data, fetchAutomations, loaderState } = useFetchAutomations({
		limit: 1,
	});

	// This function will run each time the select menu is used
	const handleChange = React.useCallback(
		(event: React.FormEvent<HTMLSelectElement> | undefined) => {
			const value = event?.currentTarget.value;
			onChange(value ? set(value) : unset());
		},
		[onChange],
	);

	useEffect(() => {
		(async () => {
			if (!data.filters.length) {
				const initPars = new URLSearchParams();
				initPars.append("verified", "true");
				await fetchAutomations(initPars);
			}
		})();
	}, [fetchAutomations, data.filters]);

	if (loaderState === "error")
		return (
			<Card tone="critical" {...cardProps}>
				<Text>There has been an error</Text>
			</Card>
		);

	if (!data.filters.length || loaderState === "loading")
		return (
			<Card tone="default" {...cardProps}>
				<Spinner />
			</Card>
		);

	return (
		<Select onChange={handleChange} value={value}>
			<option value={""}>{"Select a filter value"}</option>
			{data.filters.map((item) => (
				<option key={item.id} value={item.id}>
					{item.title}
				</option>
			))}
		</Select>
	);
}
