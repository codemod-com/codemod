import type { GetExecutionStatusResponse } from "@studio/api/getExecutionStatus";

type Status = GetExecutionStatusResponse["status"];
export const getButtonPropsByStatus = (status: Status) => {
  switch (status) {
    case "done":
    case "idle": {
      return {
        text: "Run on Github",
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
        text: "Run on Github",
        hintText:
          "This runs Codemod on your Github branch and push a commit with changes.",
      };
    }
  }
};
