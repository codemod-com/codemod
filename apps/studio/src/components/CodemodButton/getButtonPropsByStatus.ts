import type { GetExecutionStatusResponse } from "~/api/getExecutionStatus";

type Status = GetExecutionStatusResponse["status"];
export const getButtonPropsByStatus = (status?: Status | null) => {
  switch (status) {
    case "done":
    case "idle": {
      return {
        text: "Run on branch",
        hintText:
          "This runs Codemod on your Github branch and push a commit with changes.",
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
        hintText:
          "This runs Codemod on your Github branch and push a commit with changes.",
      };
    }
  }
};
