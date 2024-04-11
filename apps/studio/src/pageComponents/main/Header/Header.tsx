import * as Label from "@radix-ui/react-label";
import { GithubRepository } from "be-types";
import { pipe } from "ramda";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { GH_REPO_LIST } from "~/constants";
import { useAPI } from "~/hooks/useAPI";
import { useAuth } from "~/hooks/useAuth";
import { useModal } from "~/hooks/useModal";
import { RepositoryModal } from "~/pageComponents/main/Header/RepositoryModal";
import { TopBar } from "~/pageComponents/main/Header/TopBar";
import { useButtons } from "~/pageComponents/main/Header/useButtons";
import { usePendingActionsOnSignInStore } from "~/store/zustand/user";
import { DownloadZip } from "../DownloadZip";

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

	const [selectedRepository, setSelectedRepository] =
		useState<GithubRepository>();
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

	const buttons = useButtons(ensureSignIn);

	// Post repo to run codemod on it

	// const { post: postRepo } = useAPI<GithubRepository>();
	// const onRunCodemod = () => {
	// 	post(selectedRepository);
	// }

	// Get info about codemod progress

	// const { get: getProgressForRepo } = useAPI<GithubRepository[]>();
	// const [progress, setProgress] = useState<number>();
	// useEffect(() => {
	// 	if(progress === 100) goToGHPage()
	// }, [progress]);

	const processBar = (
		<div
			style={{
				display: "flex",
				padding: "0 20px",
				flexWrap: "wrap",
				gap: 15,
				alignItems: "center",
			}}
		>
			<Label.Root>Codemod application progress:</Label.Root>
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
				onRunCodemod={() => {} /*onRunCodemod*/}
			/>
			<TopBar />
			<div className="flex justify-between items-center h-[40px] w-full p-1 px-4">
				<div />
				<div className="flex gap-2">
					{/*{typeof progress !== undefined && processBar}*/}
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
