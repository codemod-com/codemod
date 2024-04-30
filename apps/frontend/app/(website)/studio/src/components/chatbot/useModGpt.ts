const buildCodemodFromLLMResponse = (LLMResponse: string): string | null => {
	const CODE_BLOCK_REGEXP = /```typescript(.+?)```/gs;
	const match = CODE_BLOCK_REGEXP.exec(LLMResponse);

	if (match === null || match.length < 1) {
		return null;
	}

	return match.at(1)?.trim() ?? null;
};


export const useModGPT = () => {
	const { command, setCurrentCommand, setContent } = useModStore();
	const {
		AIAssistant: { engine },
	} = useCFSStore();

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
		api: `${ env.NEXT_PUBLIC_API_URL }${ SEND_CHAT }`,
		initialMessages,
		id,
		onFinish({ content }) {
			if (command !== "learn") {
				return;
			}

			setCurrentCommand(null);

			const codemodSourceCode = buildCodemodFromLLMResponse(content);

			if (codemodSourceCode !== null) {
				setContent(codemodSourceCode);

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
			Authorization: `Bearer ${ token }`,
		},
		body: {
			engine,
		},
	});
	const { getToken, isSignedIn } = useAuth();
	const codemodExecutionError = useCodemodExecutionError();

	const aliases = useGetAliases();

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
	}, [
		setMessages,
		handleSelectPrompt,
		command,
		aliases.$BEFORE,
		aliases.$AFTER,
		isLoading,
		isSignedIn,
	]);

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
		setCurrentCommand(null);

		stop();
	}, [setCurrentCommand, stop]);
	return {
		id,
		isLoading,
		handleStop,
		append,
		reload,
		messages,
		input,
		setInput,
		setMessages,
		setToken
	}
}