import { GithubRepository } from "be-types";
import { useRouter } from "next/navigation";
import { pipe } from "ramda";
import { useEffect, useState } from "react";
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
import { useUserSession } from "~/store/zustand/userSession";
import { DownloadZip } from "../DownloadZip";
import toast from "react-hot-toast";
import { Progress } from "~/components/ui/progress";

export const Header = () => {
	const { isSignedIn, getSignIn } = useAuth();

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

	const { codemodExecutionId, codemodRunStatus, onCodemodRun } =
		useCodemodExecution();

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
	const { retrievePendingAction, hasPendingAction } = useUserSession();

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
		if (codemodExecutionId === null || codemodRunStatus === null) {
			return;
		}

		const { status, message } = codemodRunStatus;

		if (status === "done") {
			const { result } = codemodRunStatus;
			toast.success(`${message}\nRouting you to see the results.`, {
				duration: 6000,
				id: codemodExecutionId,
			});
			router.push(result.link);
		} else if (status === "progress") {
			const { progressInfo } = codemodRunStatus;

			toast(
				() => (
					<div className="flex flex-col items-center justify-center w-80">
						{progressInfo !== null && (
							<Progress
								className="mt-2"
								value={(progressInfo.processed / progressInfo.total) * 100}
							/>
						)}
						<p className="font-normal text-lg mt-3">{message}</p>
					</div>
				),
				{
					id: codemodExecutionId,
				},
			);
		}
	}, [codemodRunStatus, codemodExecutionId]);

	useEffect(() => {
		if (shouldOpenPendingRepoModal && isSignedIn) {
			showModalWithRepositories();
			retrievePendingAction("openRepoModal");
		}
	}, [isSignedIn, shouldOpenPendingRepoModal]);

	const ensureSignIn = isSignedIn
		? showModalWithRepositories
		: getSignIn({ withPendingAction: "openRepoModal" });

	const buttons = useButtons(ensureSignIn, codemodRunStatus?.status ?? "idle");

	const router = useRouter();

	const progress =
		codemodRunStatus?.status === "progress"
			? codemodRunStatus.progressInfo
			: null;
	const processBar = progress && (
		<div className="mx-2 flex h-auto items-center   rounded bg-red-500 px-2 py-0 text-sm text-gray-text-dark-title">
			<span className="mr-1 h-2 w-2 rounded bg-white p-1" />
			<Progress
				className="mt-2"
				value={(progress.processed / progress.total) * 100}
			/>
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
