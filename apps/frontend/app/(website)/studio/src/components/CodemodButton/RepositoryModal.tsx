import Modal from "@studio/components/Modal";
import { Button } from "@studio/components/ui/button";
import type { GithubRepository } from "be-types";
import { matchSorter } from "match-sorter";

import {
	Combobox,
	ComboboxItem,
	ComboboxList,
	ComboboxProvider,
} from "@ariakit/react";
import * as RadixSelect from "@radix-ui/react-select";
import { CheckIcon, ChevronUpDownIcon, SearchIcon } from "@studio/icons";
import type { ToVoid } from "@studio/types/transformations";
import { startTransition, useMemo, useState } from "react";

export type RepositoryModalProps = {
	hideRepositoryModal: VoidFunction;
	isRepositoryModalShown: boolean;
	repositoriesToShow: GithubRepository[];
	selectRepository: ToVoid<GithubRepository["full_name"]>;
	selectedRepository?: GithubRepository;
	onRunCodemod: VoidFunction;
};
export const RepositoryModal = ({
	hideRepositoryModal,
	isRepositoryModalShown,
	repositoriesToShow,
	selectRepository,
	selectedRepository,
	onRunCodemod,
}: RepositoryModalProps) => {
	const [valueToFilterBy, setValueToFilterBy] =
		useState<GithubRepository["full_name"]>();
	const [open, setOpen] = useState(false);

	const matches = useMemo(() => {
		if (!valueToFilterBy) return repositoriesToShow;
		const keys = ["full_name"];
		const matches = matchSorter(repositoriesToShow, valueToFilterBy, { keys });
		// Radix Select does not work if we don't render the selected item, so we
		// make sure to include it in the list of matches.
		const selectedRepo = repositoriesToShow.find(
			(repo) => repo.full_name === selectedRepository?.full_name,
		);
		if (selectedRepo && !matches.includes(selectedRepo)) {
			matches.push(selectedRepo);
		}
		return matches;
	}, [
		valueToFilterBy,
		selectedRepository?.full_name,
		repositoriesToShow.length,
	]);

	return isRepositoryModalShown ? (
		<Modal onClose={hideRepositoryModal} centered transparent={false}>
			<h2 className="text-center p-2">Select Repository</h2>
			<div className="flex justify-center align-items-cente p-4 bg-white min-w-[400px]">
				<RadixSelect.Root
					value={selectedRepository?.full_name}
					onValueChange={selectRepository}
					open={open}
					onOpenChange={setOpen}
				>
					<ComboboxProvider
						open={open}
						setOpen={setOpen}
						resetValueOnHide
						includesBaseElement={false}
						setValue={(value) => {
							startTransition(() => {
								setValueToFilterBy(value);
							});
						}}
					>
						<RadixSelect.Trigger aria-label="Language" className="select">
							<RadixSelect.Value placeholder="Select a repository" />
							<RadixSelect.Icon className="select-icon">
								<ChevronUpDownIcon />
							</RadixSelect.Icon>
						</RadixSelect.Trigger>
						<RadixSelect.Content
							role="dialog"
							aria-label="Languages"
							position="popper"
							className="popover"
							sideOffset={4}
							alignOffset={-16}
						>
							<div className="combobox-wrapper">
								<div className="combobox-icon">
									<SearchIcon />
								</div>
								<Combobox
									autoSelect
									placeholder="Search repositories"
									className="combobox"
									// Ariakit's Combobox manually triggers a blur event on virtually
									// blurred items, making them work as if they had actual DOM
									// focus. These blur events might happen after the corresponding
									// focus events in the capture phase, leading Radix Select to
									// close the popover. This happens because Radix Select relies on
									// the order of these captured events to discern if the focus was
									// outside the element. Since we don't have access to the
									// onInteractOutside prop in the Radix SelectContent component to
									// stop this behavior, we can turn off Ariakit's behavior here.
									onBlurCapture={(event) => {
										event.preventDefault();
										event.stopPropagation();
									}}
								/>
							</div>
							<ComboboxList className="listbox">
								{matches.map(({ full_name }) => (
									<RadixSelect.Item
										key={full_name}
										value={full_name}
										asChild
										className="item"
									>
										<ComboboxItem>
											<RadixSelect.ItemText>{full_name}</RadixSelect.ItemText>
											<RadixSelect.ItemIndicator className="item-indicator">
												<CheckIcon />
											</RadixSelect.ItemIndicator>
										</ComboboxItem>
									</RadixSelect.Item>
								))}
							</ComboboxList>
						</RadixSelect.Content>
					</ComboboxProvider>
				</RadixSelect.Root>
				<Button
					className="ml-3 text-amber-50"
					onClick={onRunCodemod}
					hint={
						!selectRepository ? (
							<p className="font-normal">
								Select repository to run the codemod
							</p>
						) : null
					}
					disabled={!selectedRepository}
				>
					Run Codemod
				</Button>
			</div>
		</Modal>
	) : null;
};
