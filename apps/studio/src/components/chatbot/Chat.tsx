import { useAuth } from "@clerk/nextjs";
import { useChat } from "ai/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { SEND_CHAT } from "~/constants/apiEndpoints";
import { env } from "~/env";
import { cn } from "~/lib/utils";
import {
	freezeMessage,
	parseFrozenMessages,
	unfreezeMessage,
} from "~/schemata/chatSchemata";
import { type RootState } from "~/store";
import { applyAliases, getAliases } from "~/store/slices/CFS/alias";
import { selectEngine } from "../../store/slices/CFS";
import { autoGenerateCodemodPrompt } from "../../store/slices/CFS/prompts";
import {
	selectMod,
	setContent,
	setCurrentCommand,
} from "../../store/slices/mod";
import ChatList from "./ChatList";
import { ChatPanel } from "./ChatPanel";
import ChatScrollAnchor from "./ChatScrollAnchor";
import EngineSelector from "./ModelSelector";
import WelcomeScreen from "./WelcomeScreen";

interface Props extends React.ComponentProps<"div"> {
	id?: string;
}

const buildCodemodFromLLMResponse = (LLMResponse: string): string | null => {
	const CODE_BLOCK_REGEXP = /```typescript(.+?)```/gs;
	const match = CODE_BLOCK_REGEXP.exec(LLMResponse);

	if (match === null || match.length < 1) {
		return null;
	}

	return match.at(1)?.trim() ?? null;
};

const Chat = ({ id, className }: Props) => {
	const dispatch = useDispatch();
	const { command } = useSelector(selectMod);
	const engine = useSelector(selectEngine);

	const executedCommand = useRef(false);

	const [token, setToken] = useState<string | null>(null);

	const initialMessages = useMemo(() => {
		try {
			if (typeof localStorage === "undefined") {
				return [];
			}

			const stringifiedFrozenMessages = localStorage.getItem("frozenMessages");

			if (stringifiedFrozenMessages === null) {
				return [];
			}

			return parseFrozenMessages(JSON.parse(stringifiedFrozenMessages)).map(
				(frozenMessage) => unfreezeMessage(frozenMessage),
			);
		} catch (error) {
			console.error(error);
			return [];
		}
	}, []);

	const {
		messages,
		append,
		reload,
		stop,
		isLoading,
		input,
		setInput,
		setMessages,
	} = useChat({
		api: `${env.NEXT_PUBLIC_API_URL}${SEND_CHAT}`,
		initialMessages,
		id,
		onFinish({ content }) {
			if (command !== "learn") {
				return;
			}

			dispatch(setCurrentCommand(null));

			const codemodSourceCode = buildCodemodFromLLMResponse(content);

			if (codemodSourceCode !== null) {
				dispatch(setContent(codemodSourceCode));

				toast.success("Auto-updated codemod based on AI response.");
			}
		},
		onResponse(response) {
			if (response.status === 400) {
				toast.error("The request you made could not be completed.");
			}

			if (response.status === 401) {
				toast.error("You are unauthorized to make this request.");
			}

			if (response.status === 403) {
				toast.error("You are not allowed to make this request.");
			}

			if (response.status === 429) {
				toast.error(
					"You have exceeded the available request quota. Please resume after one minute.",
				);
			}

			if (response.status === 500) {
				toast.error("The server has encountered an error. Please retry later.");
			}
		},
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: {
			engine,
		},
	});
	const { getToken, isSignedIn } = useAuth();

	const aliases = useSelector((state: RootState) => getAliases(state));

	const handleSelectPrompt = async (value: string) => {
		const t = await getToken();
		flushSync(() => {
			setToken(t);
		});

		const aliasesAppliedValue = applyAliases(value, aliases);
		await append({
			id,
			content: aliasesAppliedValue,
			role: "user",
			name: "prompt",
		});
	};

	useEffect(() => {
		if (
			isSignedIn &&
			command === "learn" &&
			aliases.$BEFORE !== null &&
			aliases.$AFTER !== null &&
			!isLoading &&
			// ensure this block called once
			!executedCommand.current
		) {
			executedCommand.current = true;
			setMessages([]);
			handleSelectPrompt(autoGenerateCodemodPrompt);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [command, aliases.$BEFORE, aliases.$AFTER, isLoading, isSignedIn]);

	useEffect(() => {
		if (isLoading) {
			return;
		}

		const frozenMessages = messages.map((message) => freezeMessage(message));

		try {
			localStorage.setItem("frozenMessages", JSON.stringify(frozenMessages));
		} catch (error) {
			console.error(error);
		}
	}, [messages, isLoading]);

	const handleStop = useCallback(() => {
		dispatch(setCurrentCommand(null));

		stop();
	}, [dispatch, stop]);

	return (
		<>
			<div className={cn("h-full", className)}>
				{messages.length > 0 && isSignedIn ? (
					<>
						<div className="mb-4 ml-auto w-1/3">
							<EngineSelector />
						</div>
						<ChatList messages={messages} />
						<ChatScrollAnchor trackVisibility={isLoading} />
					</>
				) : (
					<WelcomeScreen />
				)}
			</div>
			<ChatPanel
				id={id}
				isLoading={isLoading}
				stop={handleStop}
				append={append}
				reload={reload}
				messages={messages}
				input={input}
				setInput={setInput}
				setMessages={setMessages}
				setToken={setToken}
			/>
		</>
	);
};

Chat.displayName = "Chat";

export default Chat;
