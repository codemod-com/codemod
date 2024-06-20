type Status = "progress" | "error" | "executing codemod" | "done";

let defaultResponse = {
  text: "Run on Github",
  hintText:
    "This runs Codemod on your Github branch and push a commit with changes.",
};
export let getButtonPropsByStatus = (status: Status | null) =>
  status === "executing codemod"
    ? {
        text: "Codemod Running...",
        hintText: "Codemod is running on your Github branch.",
      }
    : defaultResponse;
