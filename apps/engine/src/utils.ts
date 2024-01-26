import { spawnSync } from 'node:child_process';

export const doubleQuotify = (str: string): string =>
	str.startsWith('"') && str.endsWith('"') ? str : `"${str}"`;

export const openURL = (url: string): boolean => {
	// `spawnSync` is used because `execSync` has an input length limit
	const command = process.platform === 'win32' ? 'start' : 'open';
	const args = [url];

	// By setting `shell: false`,
	// we avoid potential command-line length limitations
	// and the full URL should be passed to the default web browser without getting truncated

	try {
		spawnSync(command, args, { stdio: 'ignore', shell: false });
		return true;
	} catch (error) {
		console.error('Error while opening URL:', error);
		return false;
	}
};
