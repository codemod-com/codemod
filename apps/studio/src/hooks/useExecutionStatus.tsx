import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import getExecutionStatus, {
	GetExecutionStatusResponse,
} from "~/api/getExecutionStatus";
import { Button } from "~/components/ui/button";

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

					toast(
						(t) => (
							<span className="flex flex-col items-center justify-center w-80">
								See the results in{"\n"}
								<a
									target="_blank"
									rel="noreferrer noopener"
									href={status.result.link}
									className="mt-2"
								>
									<b>{status.result.link}</b>
								</a>
								<Button
									size="default"
									variant="outline"
									onClick={() => toast.dismiss(t.id)}
									className="mt-2"
								>
									<span className="text-md">Dismiss</span>
								</Button>
							</span>
						),
						{ duration: 1000 * 60 * 3, id: executionId }, // 3 minutes
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
