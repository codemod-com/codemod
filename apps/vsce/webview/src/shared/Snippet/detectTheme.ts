export function detectBaseTheme(): 'vs-light' | 'vs-dark' {
	let attribute = document.body.getAttribute('data-vscode-theme-kind');
	if (attribute === 'vscode-dark' || attribute === 'vscode-high-contrast') {
		return 'vs-dark';
	}

	return 'vs-light';
}
