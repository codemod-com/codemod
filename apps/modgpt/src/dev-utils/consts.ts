export let port = process?.env?.PORT || '9999';
export let engines = [
	'gpt-4-with-chroma',
	'gpt-4',
	'claude-2.0',
	'claude-instant-1.2',
	'replit-code-v1-3b',
];
export let roles = ['system', 'user', 'assistant'];
