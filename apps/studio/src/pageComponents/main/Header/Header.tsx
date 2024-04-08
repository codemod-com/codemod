import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { pipe } from "ramda";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { authUrl } from "~/config";
import { useModal } from "~/hooks/useModal";
import { ProgressModal } from "~/pageComponents/main/Header/ProgressModal";
import { RepositoryModal } from "~/pageComponents/main/Header/RepositoryModal";
import { TopBar } from "~/pageComponents/main/Header/TopBar";
import { useButtons } from "~/pageComponents/main/Header/useButtons";
import { useSnippetStore } from "~/store/zustand/snippets";
import { useUserState } from "~/store/zustand/user";
import { DownloadZip } from "../DownloadZip";
import { useTheme } from "../themeContext";

export type GHRepo = string;
const Header = () => {
	const { setEngine } = useSnippetStore();
	const { toggleTheme, isDark } = useTheme();

	const onEngineChange = (value: string) => {
		if (value === "jscodeshift" || value === "tsmorph") {
			setEngine(value);
		}
	};

	const router = useRouter();
	const { isSignedIn, getToken } = useAuth();
	const [repositoriesToShow, setRepositoriesToShow] = useState<GHRepo[]>([]);
	const {
		showModal: showRepositoryModal,
		hideModal: hideRepositoryModal,
		isModalShown: isRepositoryModalShown,
	} = useModal();
	const {
		showModal: showProgressModal,
		hideModal: hideProgressModal,
		isModalShown: isProgressModalShown,
	} = useModal();
	const [selectedRepository, setSelectedRepository] = useState<GHRepo>();
	const getRepositories = async () => {
		const token = await getToken();
		// call the API for repos
		const repositories = ["repo 1", "repo 2"];
		setRepositoriesToShow(repositories);
	};
	const {
		pendingActionsWhenSigned,
		retrievePendingAction,
		hasPendingAction,
		addPendingActionsWhenSigned,
	} = useUserState();
	const showRepositoryModalFlow = pipe(getRepositories, showRepositoryModal);
	const redirectToGHAuthFlow = pipe(
		() => addPendingActionsWhenSigned("openRepoModal"),
		() => router.push(authUrl),
	);
	const shouldOpenPendingRepoModal = hasPendingAction("openRepoModal");

	const onRunCodemod = () => console.log(selectedRepository);
	const progress = 0;
	const selectRepository = (repository: GHRepo) => console.log(repository);

	useEffect(() => {
		if (shouldOpenPendingRepoModal && isSignedIn) {
			showRepositoryModalFlow();
			retrievePendingAction("openRepoModal");
		}
	}, [isSignedIn, shouldOpenPendingRepoModal]);

	const ensureSignIn = isSignedIn
		? showRepositoryModalFlow
		: redirectToGHAuthFlow;

	const buttons = useButtons(ensureSignIn);

	return (
		<>
			<ProgressModal
				isProgressModalShown={isProgressModalShown}
				progress={progress}
				hideProgressModal={hideProgressModal}
			/>
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
				<div className="flex gap-2">
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

export default Header;
