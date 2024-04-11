import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import getExecutionStatus, {
	GetExecutionStatusResponse,
} from "~/api/getExecutionStatus";

const idleStatus = {
	status: "idle",
	message: "Not started",
} as const;

export const useExecutionStatus = (
	executionId: string | null,
): GetExecutionStatusResponse | null => {
	const [executionStatus, setExecutionStatus] =
		useState<GetExecutionStatusResponse>(idleStatus);

	const { getToken } = useAuth();

	useEffect(() => {
		let timeoutId = -1;
		const handler = async () => {
			if (executionId === null) {
				setExecutionStatus(idleStatus);
				return;
			}

			const token = await getToken();

			if (token === null) {
				return;
			}

			const executionStatusOrError = await getExecutionStatus({
				executionId,
				token,
			});

			if (executionStatusOrError.isLeft()) {
				console.error(executionStatusOrError.getLeft());
				clearTimeout(timeoutId);
			} else {
				const execution = executionStatusOrError.get();
				setExecutionStatus(execution);
				if (execution.status === "done") clearTimeout(timeoutId);
			}
		};
		timeoutId = window.setTimeout(handler, 5000);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [executionId, getToken]);

	return executionStatus;
};
