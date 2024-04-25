import Input from "@/components/shared/Input";
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
	branchesToShow: string[];
	selectBranch: ToVoid<string>;
	selectedBranch?: string;
	targetPathInput: string;
	setTargetPathInput: ToVoid<string>;
	onRunCodemod: VoidFunction;
};
export const RepositoryModal = ({
	hideRepositoryModal,
	isRepositoryModalShown,
	repositoriesToShow,
	selectRepository,
	selectedRepository,
	branchesToShow,
	selectBranch,
	selectedBranch,
	targetPathInput,
	setTargetPathInput,
	onRunCodemod,
}: RepositoryModalProps) => {
	const [repoValueToFilterBy, setRepoValueToFilterBy] =
		useState<GithubRepository["full_name"]>();
	const [branchValueToFilterBy, setBranchValueToFilterBy] = useState<string>();
	const [repoSelectorOpen, setRepoSelectorOpen] = useState(false);
	const [branchSelectorOpen, setBranchSelectorOpen] = useState(false);

	const repoMatches = useMemo(() => {
		if (!repoValueToFilterBy) return repositoriesToShow;
		const keys = ["full_name"];
		const matches = matchSorter(repositoriesToShow, repoValueToFilterBy, {
			keys,
		});
		// Radix Select does not work if we don't render the selected item, so we
		// make sure to include it in the list of matches.
		const selected = repositoriesToShow.find(
			(repo) => repo.full_name === selectedRepository?.full_name,
		);
		if (selected && !matches.includes(selected)) {
			matches.push(selected);
		}
		return matches;
	}, [
		repoValueToFilterBy,
		selectedRepository?.full_name,
		repositoriesToShow.length,
	]);

	const branchMatches = useMemo(() => {
		if (!branchValueToFilterBy) return branchesToShow;
		const matches = matchSorter(branchesToShow, branchValueToFilterBy);
		const selected = branchesToShow.find((branch) => branch === selectedBranch);
		if (selected && !matches.includes(selected)) {
			matches.push(selected);
		}
		return matches;
	}, [branchValueToFilterBy, selectedBranch, branchesToShow.length]);

	return isRepositoryModalShown ? (
		<Modal onClose={hideRepositoryModal} centered transparent={false}>
			<h2 className="text-center p-2">Run Codemod on Github branch</h2>
			<div className="flex justify-center items-center p-4 bg-white min-w-[400px] rounded-lg border-0">
				<RadixSelect.Root
					value={selectedRepository?.full_name}
					onValueChange={selectRepository}
					open={repoSelectorOpen}
					onOpenChange={setRepoSelectorOpen}
				>
					<ComboboxProvider
						open={repoSelectorOpen}
						setOpen={setRepoSelectorOpen}
						resetValueOnHide
						includesBaseElement={false}
						setValue={(value) => {
							startTransition(() => {
								setRepoValueToFilterBy(value);
							});
						}}
					>
						<RadixSelect.Trigger
							aria-label="Language"
							className="select flex items-center"
						>
							<RadixSelect.Value placeholder="Select a repository (required)" />
							<RadixSelect.Icon className="select-icon ml-1">
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
								{repoMatches.map(({ full_name }) => (
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
			</div>

			{selectedRepository && (
				<div className="flex justify-center items-center p-4 bg-white min-w-[400px] rounded-lg border-0">
					<RadixSelect.Root
						value={selectedBranch}
						onValueChange={selectBranch}
						open={branchSelectorOpen}
						onOpenChange={setBranchSelectorOpen}
					>
						<ComboboxProvider
							open={branchSelectorOpen}
							setOpen={setBranchSelectorOpen}
							resetValueOnHide
							includesBaseElement={false}
							setValue={(value) => {
								startTransition(() => {
									setBranchValueToFilterBy(value);
								});
							}}
						>
							<RadixSelect.Trigger
								aria-label="Language"
								className="select flex items-center"
							>
								<RadixSelect.Value placeholder="Select a branch (required)" />
								<RadixSelect.Icon className="select-icon ml-1">
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
										placeholder="Search branches"
										className="combobox"
										onBlurCapture={(event) => {
											event.preventDefault();
											event.stopPropagation();
										}}
									/>
								</div>
								<ComboboxList className="listbox">
									{branchMatches.map((branch) => (
										<RadixSelect.Item
											key={branch}
											value={branch}
											asChild
											className="item"
										>
											<ComboboxItem>
												<RadixSelect.ItemText>{branch}</RadixSelect.ItemText>
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
				</div>
			)}

			{selectedRepository && selectedBranch && (
				<div className="flex justify-center items-center p-4 bg-white min-w-[400px] rounded-lg border-0">
					<p className="text-center text-xs">Target path (optional)</p>
					<Input
						type="text"
						value={targetPathInput}
						placeholder="/packages/apps/frontend/"
						onChange={(event: any) => setTargetPathInput(event.target.value)}
					/>
				</div>
			)}

			<Button
				className="m-3 text-amber-50"
				onClick={onRunCodemod}
				hint={
					!selectedRepository ? (
						<p className="font-normal">Select repository to run the codemod</p>
					) : !selectedBranch ? (
						<p className="font-normal">Select branch to run the codemod</p>
					) : null
				}
				disabled={!selectedRepository || !selectedBranch}
			>
				Run Codemod
			</Button>
		</Modal>
	) : null;
};
