export function detectBaseTheme(): "vs-light" | "vs-dark" {
	const attribute = document.body.getAttribute("data-vscode-theme-kind");
	if (attribute === "vscode-dark" || attribute === "vscode-high-contrast") {
		return "vs-dark";
	}

	return "vs-light";
}
