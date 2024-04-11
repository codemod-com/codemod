import { useState } from "react";

import { RUN_CODEMOD } from "~/constants";
import { JSEngine } from "~/types/Engine";
import { ExecuteCodemodRequest, useAPI } from "./useAPI";
import { useExecutionStatus } from "./useExecutionStatus";

export const useCodemodExecution = ({
	engine,
	source,
	target,
}: {
	engine: JSEngine;
	source: string | null;
	target: string | null;
}) => {
	const [executionId, setExecutionId] = useState<string | null>(null);

	const codemodRunStatus = useExecutionStatus(executionId);
	const { post: runCodemod } = useAPI(RUN_CODEMOD);

	const onCodemodRun = async () => {
		if (source === null || target === null) {
			return;
		}

		try {
			const { data } = await runCodemod<
				{ codemodExecutionId: string },
				ExecuteCodemodRequest
			>({
				engine,
				source,
				target,
			});

			const { codemodExecutionId } = data;
			setExecutionId(codemodExecutionId);
		} catch (e) {}
	};

	const onCodemodRunCancel = async () => {
		// @TODO add ability to cancel current run
	};

	return {
		onCodemodRun,
		onCodemodRunCancel,
		codemodRunStatus,
		executionId,
	};
};
