import { useState } from "react";

import { RUN_CODEMOD } from "~/constants";
import { ExecuteCodemodRequest, useAPI } from "./useAPI";
import { useExecutionStatus } from "./useExecutionStatus";

export const useCodemodExecution = ([
	executionId = null,
	setExecutionId,
]: ReturnType<typeof useState<string | null>>) => {
	const codemodRunStatus = useExecutionStatus(executionId);
	const { post: runCodemod } = useAPI(RUN_CODEMOD);

	const onCodemodRun = async (request: ExecuteCodemodRequest) => {
		try {
			const { data } = await runCodemod<
				{ codemodExecutionId: string },
				ExecuteCodemodRequest
			>(request);

			const { codemodExecutionId } = data;
			setExecutionId(codemodExecutionId);

			return data;
		} catch (e) {}
	};

	const onCodemodRunCancel = async () => {
		// @TODO add ability to cancel current run

		setExecutionId(null);
	};

	return {
		onCodemodRun,
		onCodemodRunCancel,
		codemodRunStatus,
		executionId,
	};
};
