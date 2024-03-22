import { spawnSync } from "node:child_process";

export const doubleQuotify = (str: string): string =>
	str.startsWith('"') && str.endsWith('"') ? str : `"${str}"`;

export const openURL = (url: string): boolean => {
	// `spawnSync` is used because `execSync` has an input length limit
	const command = process.platform === "win32" ? "start" : "open";
	const args = [url];

	// By setting `shell: false`,
	// we avoid potential command-line length limitations
	// and the full URL should be passed to the default web browser without getting truncated

	try {
		spawnSync(command, args, { stdio: "ignore", shell: false });
		return true;
	} catch (error) {
		console.error("Error while opening URL:", error);
		return false;
	}
};

export const boldText = (text: string) => {
	return `\x1b[1m${text}\x1b[22m`;
};

export const colorizeText = (text: string, color: keyof typeof COLOR_MAP) => {
	return `${COLOR_MAP[color]}${text}\x1b[39m`;
};

export const COLOR_MAP = {
	cyan: "\x1b[36m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	orange: "\x1b[33m",
};
