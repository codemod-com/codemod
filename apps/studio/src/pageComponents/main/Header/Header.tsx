import { GithubRepository } from "be-types";
import { useRouter } from "next/navigation";
import { pipe } from "ramda";
import { useEffect, useState } from "react";
import { GetExecutionStatusResponse } from "~/api/getExecutionStatus";
import { Button } from "~/components/ui/button";
import { GH_REPO_LIST } from "~/constants";
import { useAPI } from "~/hooks/useAPI";
import { useAuth } from "~/hooks/useAuth";
import { useCodemodExecution } from "~/hooks/useCodemodExecution";
import { useModal } from "~/hooks/useModal";
import { RepositoryModal } from "~/pageComponents/main/Header/RepositoryModal";
import { TopBar } from "~/pageComponents/main/Header/TopBar";
import { useButtons } from "~/pageComponents/main/Header/useButtons";
import { useModStore } from "~/store/zustand/mod";
import { useSnippetStore } from "~/store/zustand/snippets";
import { usePendingActionsOnSignInStore } from "~/store/zustand/user";
import { DownloadZip } from "../DownloadZip";

export const Header = () => {
	const { isSignedIn, getSignIn } = useAuth();
	const [executionId, setExecutionId] = useState<string | null>();
	const [executionStatus, setExecutionStatus] =
		useState<GetExecutionStatusResponse>();

	const [repositoriesToShow, setRepositoriesToShow] = useState<
		GithubRepository[]
	>([]);

	const {
		showModal: showRepositoryModal,
		hideModal: hideRepositoryModal,
		isModalShown: isRepositoryModalShown,
	} = useModal();

	const { get: getRepos } = useAPI<GithubRepository[]>(GH_REPO_LIST);

	const { engine } = useSnippetStore();
	const { internalContent } = useModStore();

	const [selectedRepository, setSelectedRepository] =
		useState<GithubRepository>();

	const { codemodRunStatus, onCodemodRun } = useCodemodExecution([
		executionId,
		setExecutionId,
	]);

	const isCodemodRunIdle = codemodRunStatus?.status === "idle";
	const isCodemodSourceNotEmpty = internalContent?.trim() !== "";

	const handleCodemodRun = async () => {
		if (
			selectedRepository === undefined ||
			internalContent === null ||
			!isCodemodSourceNotEmpty
		) {
			return;
		}

		await onCodemodRun({
			engine,
			target: selectedRepository.full_name,
			source: internalContent,
		});

		hideRepositoryModal();
	};

	const getRepositories = async () => {
		const repositories = (await getRepos()).data;
		setRepositoriesToShow(repositories);
	};
	const { retrievePendingAction, hasPendingAction } =
		usePendingActionsOnSignInStore();

	const showModalWithRepositories = pipe(
		getRepositories,
		async (x) => await x,
		showRepositoryModal,
	);
	const shouldOpenPendingRepoModal = hasPendingAction("openRepoModal");

	const selectRepository = (name: GithubRepository["full_name"]) =>
		setSelectedRepository(
			repositoriesToShow.find((repo) => repo.full_name === name),
		);

	useEffect(() => {
		if (shouldOpenPendingRepoModal && isSignedIn) {
			showModalWithRepositories();
			retrievePendingAction("openRepoModal");
		}
	}, [isSignedIn, shouldOpenPendingRepoModal]);

	const ensureSignIn = isSignedIn
		? showModalWithRepositories
		: getSignIn({ withPendingAction: "openRepoModal" });

	const buttons = useButtons(
		ensureSignIn,
		isCodemodRunIdle,
		isCodemodSourceNotEmpty,
	);

	const router = useRouter();
	useEffect(() => {
		if (executionStatus?.status === "done")
			router.push(executionStatus.result.link);
	}, [executionStatus, router]);

	const progress =
		executionStatus?.status === "progress"
			? executionStatus.progressInfo
			: null;
	const processBar = progress && (
		<div className=" mx-2 flex h-auto items-center   rounded bg-red-500 px-2 py-0 text-sm text-gray-text-dark-title">
			<span className="mr-1 h-2 w-2 rounded bg-white p-1" />
			Progress: {Math.floor((progress.processed * 100) / progress.total)}%
		</div>
	);

	return (
		<>
			<RepositoryModal
				hideRepositoryModal={hideRepositoryModal}
				isRepositoryModalShown={isRepositoryModalShown}
				repositoriesToShow={repositoriesToShow}
				selectRepository={selectRepository}
				selectedRepository={selectedRepository}
				onRunCodemod={handleCodemodRun}
			/>
			<TopBar />
			<div className="flex justify-between items-center h-[40px] w-full p-1 px-4">
				<div />
				<div className="flex gap-2">
					{processBar}
					{buttons.map(({ Icon, hintText, ...button }) => (
						<Button
							size="xs"
							variant="outline"
							className="flex gap-1"
							hint={<p className="font-normal">{hintText}</p>}
							{...button}
						>
							{Icon && <Icon className="h-4 w-4" />}
							{button.text}
						</Button>
					))}
					<DownloadZip />
				</div>
			</div>
		</>
	);
};
