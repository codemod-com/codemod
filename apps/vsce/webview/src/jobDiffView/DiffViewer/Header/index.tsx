import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import cn from "classnames";
import { ReactComponent as SplitIcon } from "../../../assets/Split.svg";
import { ReactComponent as UnifiedIcon } from "../../../assets/Unified.svg";
import CustomPopover from "../../../shared/CustomPopover";
import { DiffViewType } from "../../../shared/types";
import styles from "./style.module.css";

type Props = Readonly<{
	viewType: DiffViewType;
	onViewChange(value: DiffViewType): void;
	changeJob: (direction: "prev" | "next") => void;
}>;

export const Header = (props: Props) => {
	return (
		<div className={styles.root}>
			<div className={styles.actionsContainer}>
				<CustomPopover
					content={
						<div
							style={{
								padding: "8px",
								backgroundColor: "var(--vscode-tab-inactiveBackground)",
							}}
						>
							Move to the previous file
						</div>
					}
					placement="right"
				>
					<VSCodeButton
						appearance="icon"
						onClick={(event) => {
							event.preventDefault();

							props.changeJob("prev");
						}}
					>
						<span className={cn("codicon", "codicon-arrow-left")} />
					</VSCodeButton>
				</CustomPopover>
				<CustomPopover
					content={
						<div
							style={{
								padding: "8px",
								backgroundColor: "var(--vscode-tab-inactiveBackground)",
							}}
						>
							Move to the next file
						</div>
					}
					placement="right"
				>
					<VSCodeButton
						appearance="icon"
						onClick={(event) => {
							event.preventDefault();

							props.changeJob("next");
						}}
					>
						<span className={cn("codicon", "codicon-arrow-right")} />
					</VSCodeButton>
				</CustomPopover>
			</div>
			<div className={styles.buttonGroup}>
				{props.viewType === "side-by-side" ? (
					<VSCodeButton
						title="Inline"
						appearance="icon"
						onClick={() => props.onViewChange("inline")}
					>
						Inline <UnifiedIcon className={styles.icon} />
					</VSCodeButton>
				) : (
					<VSCodeButton
						title="Side by Side"
						appearance="icon"
						onClick={() => props.onViewChange("side-by-side")}
					>
						Side by Side <SplitIcon className={styles.icon} />
					</VSCodeButton>
				)}
			</div>
		</div>
	);
};
