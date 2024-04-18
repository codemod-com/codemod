import type { CaseHash } from "../cases/types";

export type ErrorEvent =
	| Readonly<{
			kind: "failedToExecuteCommand";
			commandName: string;
	  }>
	| Readonly<{
			kind: "failedToBootstrapEngines";
			message: string;
	  }>;

export type Event =
	| Readonly<{
			kind: "codemodExecuted";
			fileCount: number;
			executionId: CaseHash;
			codemodName: string;
	  }>
	| Readonly<{
			kind: "codemodHalted";
			fileCount: number;
			executionId: CaseHash;
			codemodName: string;
	  }>
	| Readonly<{
			kind: "jobsAccepted";
			jobCount: number;
			executionId: CaseHash;
	  }>
	| Readonly<{
			kind: "jobsRejected";
			jobCount: number;
			executionId: CaseHash;
	  }>;
export interface Telemetry {
	sendEvent(event: Event): void;

	sendError(error: ErrorEvent): void;
}
