import { GithubRepository } from "be-types";
import { useState } from "react";
import { useCodemodExecution } from "~/hooks/useCodemodExecution";
import { ProgressBar } from "~/pageComponents/main/Header/ProgressBar";
import { RepositoryModal } from "~/pageComponents/main/Header/RepositoryModal";
import { TopBar } from "~/pageComponents/main/Header/TopBar";
import { HeaderButtons } from "~/pageComponents/main/Header/headerButtons";
import { useHandleCodemodRun } from "~/pageComponents/main/Header/useHandleCodemodRun";
import { useOpenRepoModalAfterSignIn } from "~/pageComponents/main/Header/useOpenRepoModalAfterSignIn";
import { DownloadZip } from "../DownloadZip";

export const Header = () => {
	const [repositoriesToShow, setRepositoriesToShow] = useState<
		GithubRepository[]
	>([]);

	const {
		showModalWithRepositories,
		hideRepositoryModal,
		isRepositoryModalShown,
	} = useOpenRepoModalAfterSignIn(setRepositoriesToShow);

	const [selectedRepository, setSelectedRepository] =
		useState<GithubRepository>();

	const { codemodRunStatus, onCodemodRunCancel } = useCodemodExecution();

	const selectRepository = (name: GithubRepository["full_name"]) =>
		setSelectedRepository(
			repositoriesToShow.find((repo) => repo.full_name === name),
		);

	const headerButtonsProps = {
		showModalWithRepositories,
		onCodemodRunCancel,
		codemodRunStatus: codemodRunStatus?.status ?? "idle",
	};

	const handleCodemodRun = useHandleCodemodRun(selectedRepository);

	const onRunCodemod = async () => {
		await handleCodemodRun();
		hideRepositoryModal();
	};

	return (
		<>
			<RepositoryModal
				hideRepositoryModal={hideRepositoryModal}
				isRepositoryModalShown={isRepositoryModalShown}
				repositoriesToShow={repositoriesToShow}
				selectRepository={selectRepository}
				selectedRepository={selectedRepository}
				onRunCodemod={onRunCodemod}
			/>
			<TopBar />
			<div className="flex justify-between items-center h-[40px] w-full p-1 px-4">
				<div />
				<div className="flex gap-2 items-center">
					<ProgressBar codemodRunStatus={codemodRunStatus} />
					<HeaderButtons {...headerButtonsProps} />
					<DownloadZip />
				</div>
			</div>
		</>
	);
};
