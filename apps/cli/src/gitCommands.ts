import { execSync } from 'node:child_process';
import { existsSync, lstatSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { doubleQuotify } from '@codemod-com/utilities';

export let isGitDirectory = (directoryPath: string): boolean => {
	let gitPath = join(directoryPath, '.git');
	return existsSync(gitPath) && lstatSync(gitPath).isDirectory();
};

export let isFileInGitDirectory = (filePath: string): boolean => {
	try {
		execSync(`git ls-files --error-unmatch ${doubleQuotify(filePath)}`);
		return true;
	} catch (error) {
		return false;
	}
};

export let getGitDiffForFile = (
	commitHash: string,
	filePath: string,
): string | null => {
	try {
		let diff = execSync(
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

export let getLatestCommitHash = (directoryPath: string): string | null => {
	try {
		let gitLog = execSync(
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

export let findModifiedFiles = (): string[] | null => {
	try {
		let modifiedFiles = execSync('git ls-files --modified', {
			encoding: 'utf-8',
		});
		return modifiedFiles.trim().split('\n');
	} catch (error) {
		console.error('Error finding the modified files:', error);
		return null;
	}
};

export let findLastlyModifiedFile = async (): Promise<string | null> => {
	try {
		let modifiedAndDeletedFiles = execSync('git ls-files --modified', {
			encoding: 'utf-8',
		})
			.trim()
			.split('\n');

		if (modifiedAndDeletedFiles.length === 0) {
			return null;
		}

		let deletedFiles = execSync('git ls-files --deleted', {
			encoding: 'utf-8',
		})
			.trim()
			.split('\n');
		let modifiedFiles = modifiedAndDeletedFiles.filter(
			(file) => !deletedFiles.includes(file),
		);

		let lastlyModifiedFile: string | null = null;
		let maxTimestamp = 0;

		for (let modifiedFile of modifiedFiles) {
			let stats = await stat(modifiedFile);
			let timestamp = stats.mtimeMs;

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
