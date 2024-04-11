import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
				setExecutionStatus({
					status: "error",
					message: executionStatusOrError.getLeft()?.message,
				});
			} else {
				const status = executionStatusOrError.get();

				setExecutionStatus(status);

				if (status.status === "done") {
					clearTimeout(timeoutId);

					toast.success(
						`${status.message}\nGo to ${status.result.link} to see the results.`,
						{ duration: 6000, id: executionId },
					);

					toast(
						(t) => (
							<span className="flex flex-col items-center justify-center w-80">
								{`Go to ${(
									<a
										target="_blank"
										rel="noreferrer noopener"
										href={status.result.link}
									>
										{status.result.link}
									</a>
								)} to see the results.`}
								<button type="button" onClick={() => toast.dismiss(t.id)}>
									Dismiss
								</button>
							</span>
						),
						{ duration: 1000 * 60 * 3 }, // 3 minutes
					);

					return;
				}

				timeoutId = window.setTimeout(handler, 5000);
			}
		};

		handler();

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [executionId, getToken]);

	return executionStatus;
};
