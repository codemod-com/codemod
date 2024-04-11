import { RUN_CODEMOD } from "~/constants";
import { useUserSession } from "~/store/zustand/userSession";
import { ExecuteCodemodRequest, useAPI } from "./useAPI";
import { useExecutionStatus } from "./useExecutionStatus";

export const useCodemodExecution = () => {
	const { codemodExecutionId, setCodemodExecutionId } = useUserSession();

	const codemodRunStatus = useExecutionStatus(codemodExecutionId);
	const { post: runCodemod } = useAPI(RUN_CODEMOD);

	const onCodemodRun = async (request: ExecuteCodemodRequest) => {
		try {
			const { data } = await runCodemod<
				{ codemodExecutionId: string },
				ExecuteCodemodRequest
			>(request);

			const { codemodExecutionId } = data;
			// @TODO
			setCodemodExecutionId(Math.random().toString());

			return data;
		} catch (e) {}
	};

	const onCodemodRunCancel = async () => {
		// @TODO add ability to cancel current run

		setCodemodExecutionId(null);
	};

	return {
		onCodemodRun,
		onCodemodRunCancel,
		codemodRunStatus,
		codemodExecutionId,
	};
};
