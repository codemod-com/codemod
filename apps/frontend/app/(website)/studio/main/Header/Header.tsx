import { CodemodButton } from "@studio/components/CodemodButton";
import { DownloadZip } from "../DownloadZip";
import { TopBar } from "./TopBar";
import { HeaderButtons } from "./headerButtons";

export const Header = () => {
	return (
		<>
			<TopBar />
			<div className="flex justify-between items-center h-[40px] w-full p-1 px-4">
				<div />
				<div className="flex gap-2 items-center">
					<CodemodButton />
					<HeaderButtons />
					<DownloadZip />
				</div>
			</div>
		</>
	);
};
