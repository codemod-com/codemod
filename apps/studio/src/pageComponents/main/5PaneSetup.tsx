import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PanelGroup } from "react-resizable-panels";
import getAccessToken from "~/api/getAccessToken";
import Panel from "~/components/Panel";
import AuthenticatedAccess from "~/components/authenticatedAccess";
import ClearInputButton from "~/components/button/ClearInputButton";
import InsertExampleButton from "~/components/button/InsertExampleButton";
import Chat from "~/components/chatbot/Chat";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { DownloadZip } from "~/pageComponents/main/DownloadZip";
import { SEARCH_PARAMS_KEYS } from "~/store/getInitialState";
import { selectEngine } from "~/store/slices/snippets";
import { TabNames, selectActiveTab, viewSlice } from "~/store/slices/view";
import { openLink } from "~/utils/openLink";
import ResizeHandle from "../../components/ResizePanel/ResizeHandler";
import Text from "../../components/Text";
import PageBottomPane from "./BottomPane";
import Codemod from "./Codemod";
import { DialogWithLoginToken } from "./DialogWithLoginToken";
import Header from "./Header";
import Layout from "./Layout";
import LiveIcon from "./LiveIcon";
import Table from "./Log/Table";

const isServer = typeof window === "undefined";
const ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_1 = "accessTokenRequested"; // For backwards-compatibility
const ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_2 =
	"accessTokenRequestedByVSCE";
const ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY = "accessTokenRequestedByCLI";
const ACCESS_TOKEN_REQUESTED_KEYS = [
	ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_1,
	ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_2,
	ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY,
];
const TWO_MINS_IN_MS = 2 * 60 * 1000;

const routeUserToVSCodeWithAccessToken = async (clerkToken: string) => {
	const accessTokenEither = await getAccessToken({
		clerkToken,
	});

	if (accessTokenEither.isLeft()) {
		console.error(accessTokenEither.getLeft());
		return;
	}
	const accessToken = accessTokenEither.get();

	const vscodeUrl = new URL("vscode://codemod.codemod-vscode-extension/");
	const searchParams = new URLSearchParams();

	searchParams.set(SEARCH_PARAMS_KEYS.ACCESS_TOKEN, accessToken);
	vscodeUrl.search = searchParams.toString();
	openLink(vscodeUrl.toString());
};

const Main = () => {
	const { isSignedIn, getToken } = useAuth();
	const [CLICommandDialogVisible, setCLICommandDialogVisible] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (!isSignedIn) {
			return;
		}
		(async () => {
			const clerkToken = await getToken();
			if (clerkToken === null) {
				return;
			}
			const timestamp =
				localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_1) ??
				localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_VSCE_STORAGE_KEY_2) ??
				localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY);

			if (
				timestamp === null ||
				new Date().getTime() - parseInt(timestamp, 10) > TWO_MINS_IN_MS
			) {
				return;
			}

			if (localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY)) {
				setCLICommandDialogVisible(true);
			} else {
				await routeUserToVSCodeWithAccessToken(clerkToken);
			}
			ACCESS_TOKEN_REQUESTED_KEYS.forEach((key) =>
				localStorage.removeItem(key),
			);
		})();
	}, [isSignedIn, getToken]);

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

		if (command === null || !ACCESS_TOKEN_REQUESTED_KEYS.includes(command)) {
			return;
		}

		if (isSignedIn) {
			(async () => {
				const clerkToken = await getToken();
				if (clerkToken === null) {
					return;
				}
				if (command === ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY) {
					setCLICommandDialogVisible(true);
					return;
				}
				await routeUserToVSCodeWithAccessToken(clerkToken);
			})();
			return;
		}

		localStorage.setItem(command, new Date().getTime().toString());

		router.push("/auth/sign-in");
	}, [getToken, isSignedIn, router]);

	return (
		<>
			<LoginWarningModal />
			<DialogWithLoginToken
				isOpen={CLICommandDialogVisible}
				setIsOpen={setCLICommandDialogVisible}
			/>

			<Layout>
				<Layout.Header>
					<Header />
				</Layout.Header>
				<Layout.Content gap="gap-2">
					<PanelGroup autoSaveId="main-layout" direction="vertical">
						<Layout.ResizablePanel
							collapsible
							defaultSize={50}
							minSize={0}
							style={{
								flexBasis: isServer ? "50%" : "0",
							}}
						>
							<PanelGroup direction="horizontal">
								<Layout.ResizablePanel
									className="relative bg-gray-bg dark:bg-gray-light"
									collapsible
									defaultSize={50}
									minSize={0}
									style={{
										flexBasis: isServer ? "50%" : "0",
									}}
								>
									<AssistantTab />
								</Layout.ResizablePanel>

								<ResizeHandle direction="horizontal" />

								<Layout.ResizablePanel
									className="relative bg-gray-bg dark:bg-gray-light"
									collapsible
									defaultSize={50}
									minSize={0}
									style={{
										flexBasis: isServer ? "50%" : "0",
									}}
								>
									<Panel.Header>
										<Panel.HeaderTab>
											<Panel.HeaderTitle>
												Codemod
												<div className="flex items-center gap-1">
													<DownloadZip />
													<ClearInputButton />
													<InsertExampleButton />
												</div>
											</Panel.HeaderTitle>
										</Panel.HeaderTab>
									</Panel.Header>
									<Codemod />
								</Layout.ResizablePanel>
							</PanelGroup>
						</Layout.ResizablePanel>
						<ResizeHandle direction="vertical" />
						<PageBottomPane />
					</PanelGroup>
				</Layout.Content>
			</Layout>
		</>
	);
};

const LoginWarningModal = () => {
	const { isSignedIn, isLoaded } = useAuth();
	const isFromCLI = useSearchParams().get("command") === "learn";
	const [isOpen, setIsOpen] = useState(false);
	useEffect(() => {
		setIsOpen(isFromCLI && isLoaded && !isSignedIn);
	}, [isFromCLI, isSignedIn, isLoaded]);

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Unlock AI&apos;s full potential</AlertDialogTitle>
				</AlertDialogHeader>

				<p>
					Sign in to Codemod & let AI automatically create your codemod.
					Alternatively, proceed to Codemod Studio & create your codemod with
					non-AI tools.
				</p>

				<AlertDialogFooter>
					<AlertDialogCancel asChild>
						<Button variant="secondary">Proceed without AI</Button>
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<SignInButton>
							<Button>Sign in</Button>
						</SignInButton>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

const AssistantTab = () => {
	const activeTab = useSelector(selectActiveTab);
	const engine = useSelector(selectEngine);
	const dispatch = useDispatch();

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const savedScrollPositionRef = useRef<number>(0);
	const { isSignedIn } = useAuth();

	const handleOnClick = useCallback(
		(newActiveTab: TabNames) => {
			dispatch(viewSlice.actions.setActiveTab(newActiveTab));
		},
		[dispatch],
	);

	useEffect(() => {
		if (activeTab === TabNames.MODGPT && scrollContainerRef.current !== null) {
			scrollContainerRef.current.scrollTop = savedScrollPositionRef.current;
		}
	}, [activeTab]);

	const handleScroll = () => {
		if (activeTab === TabNames.MODGPT && scrollContainerRef.current !== null) {
			savedScrollPositionRef.current = scrollContainerRef.current.scrollTop;
		}
	};

	if (engine === "tsmorph") {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Text>The Assistant is not yet available for TS-Morph codemods.</Text>
			</div>
		);
	}

	return (
		<Tabs
			value={activeTab}
			className="h-full w-full"
			onValueChange={(value: string) => {
				handleOnClick(value as TabNames);
			}}
		>
			<TabsList
				className={cn("absolute h-[2.5rem] w-full rounded-none z-1", {
					"z-[100]": isSignedIn,
				})}
			>
				<TabsTrigger className="flex-1" value={TabNames.MODGPT}>
					ModGPT
				</TabsTrigger>
				<TabsTrigger className="flex-1" value={TabNames.DEBUG}>
					<LiveIcon />
					Debug
				</TabsTrigger>
			</TabsList>

			<TabsContent
				className="scrollWindow mt-0 h-full overflow-y-auto bg-gray-bg-light pt-[2.5rem] dark:bg-gray-darker"
				value={TabNames.MODGPT}
				onScroll={handleScroll}
				ref={scrollContainerRef}
			>
				<AuthenticatedAccess>
					<Chat />
				</AuthenticatedAccess>
			</TabsContent>
			<TabsContent
				className="mt-0 h-full pt-[2.5rem] overflow-auto"
				value={TabNames.DEBUG}
			>
				<Table />
			</TabsContent>
		</Tabs>
	);
};

export default Main;
