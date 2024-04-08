import Modal from "~/components/Modal";
import { Button } from "~/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { GHRepo } from "~/pageComponents/main/Header/Header";
import { useTheme } from "~/pageComponents/main/themeContext";
import { ToVoid } from "~/types/transformations";

export type RepositoryModalProps = {
	hideRepositoryModal: VoidFunction;
	isRepositoryModalShown: boolean;
	repositoriesToShow: GHRepo[];
	selectRepository: ToVoid<GHRepo>;
	selectedRepository?: GHRepo;
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
	const { isDark } = useTheme();
	return isRepositoryModalShown ? (
		<Modal onClose={hideRepositoryModal} centered transparent={false}>
			<div
				className="flex justify-center align-items-center"
				style={{ padding: "24px", background: "white" }}
			>
				<Select onValueChange={selectRepository} value={selectedRepository}>
					<SelectTrigger className="flex w-full select-none items-center font-semibold">
						<span
							className={cn("mr-[0.75rem] text-xs font-light text-slate-500", {
								"text-slate-200": isDark,
							})}
						>
							Select repository:
						</span>
						<SelectValue placeholder={selectedRepository} />
					</SelectTrigger>
					<SelectContent>
						{repositoriesToShow.map((e) => (
							<SelectItem
								key={e}
								value={e}
								className={cn({
									"font-semibold": selectedRepository === e,
								})}
							>
								{e}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button className="ml-3 text-amber-50" onClick={onRunCodemod}>
					Run Codemod
				</Button>
			</div>
		</Modal>
	) : null;
};
