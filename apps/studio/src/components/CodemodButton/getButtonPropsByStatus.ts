import { GetExecutionStatusResponse } from "~/api/getExecutionStatus";

type Status = GetExecutionStatusResponse["status"];
export const getButtonPropsByStatus = (status?: Status | null) => {
	switch (status) {
		case "done":
		case "idle": {
			return {
				text: "Run on branch",
				hintText: "Run Codemod on branch",
			};
		}
		case "progress": {
			return {
				text: "Stop",
				hintText: "Terminate current codemod run",
			};
		}
		default: {
			return {
				text: "Run on branch",
				hintText: "Run Codemod on branch",
			};
		}
	}
};
