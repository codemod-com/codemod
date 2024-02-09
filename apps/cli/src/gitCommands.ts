import { execSync } from 'node:child_process';
import { existsSync, lstatSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { doubleQuotify } from './utils.js';

export const isGitDirectory = (directoryPath: string): boolean => {
	const gitPath = join(directoryPath, '.git');
	return existsSync(gitPath) && lstatSync(gitPath).isDirectory();
};

export const isFileInGitDirectory = (filePath: string): boolean => {
	try {
		execSync(`git ls-files --error-unmatch ${doubleQuotify(filePath)}`);
		return true;
	} catch (error) {
		return false;
	}
};

export const getGitDiffForFile = (
	commitHash: string,
	filePath: string,
): string | null => {
	try {
		const diff = execSync(
			`git diff ${commitHash} --unified=0 ${doubleQuotify(filePath)}`,
		);
		return diff.toString();
	} catch (error) {
		if (!(error instanceof Error)) {
			return null;
		}
		console.error('Error while getting Git diff for file:', error.message);
		return null;
	}
};

export const getLatestCommitHash = (directoryPath: string): string | null => {
	try {
		const gitLog = execSync(
			`git -C ${doubleQuotify(directoryPath)} log -n 1 --format=%H`,
		);
		return gitLog.toString().trim();
	} catch (error) {
		if (!(error instanceof Error)) {
			return null;
		}
		console.error('Error while getting latest commit hash:', error.message);
		return null;
	}
};

export const findModifiedFiles = (): string[] | null => {
	try {
		const modifiedFiles = execSync('git ls-files --modified', {
			encoding: 'utf-8',
		});
		return modifiedFiles.trim().split('\n');
	} catch (error) {
		console.error('Error finding the modified files:', error);
		return null;
	}
};

export const findLastlyModifiedFile = async (): Promise<string | null> => {
	try {
		const modifiedAndDeletedFiles = execSync('git ls-files --modified', {
			encoding: 'utf-8',
		})
			.trim()
			.split('\n');

		if (modifiedAndDeletedFiles.length === 0) {
			return null;
		}

		const deletedFiles = execSync('git ls-files --deleted', {
			encoding: 'utf-8',
		})
			.trim()
			.split('\n');
		const modifiedFiles = modifiedAndDeletedFiles.filter(
			(file) => !deletedFiles.includes(file),
		);

		let lastlyModifiedFile: string | null = null;
		let maxTimestamp = 0;

		for (const modifiedFile of modifiedFiles) {
			const stats = await stat(modifiedFile);
			const timestamp = stats.mtimeMs;

			if (maxTimestamp < timestamp) {
				lastlyModifiedFile = modifiedFile;
				maxTimestamp = timestamp;
			}
		}
		return lastlyModifiedFile;
	} catch (error) {
		console.error('Error finding the modified files:', error);
		return null;
	}
};
