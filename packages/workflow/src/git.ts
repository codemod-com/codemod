import { invariant } from 'ts-invariant';
import { cwdContext, getCwdContext, repositoryContext } from './contexts.js';
import { getTmpDir, isDirectory } from './fs';
import { clc, logger } from './helpers';
import { spawn } from './spawn';

let getDefaultBranchFromRemote = async (repository: string) => {
	let { stdout } = await spawn(
		'git',
		['ls-remote', '--symref', repository, 'HEAD'],
		{ doNotThrowError: true },
	);
	return stdout.join('').match(/refs\/heads\/(\S+)/m)?.[1];
};

let getBranchHashFromRemote = async (repositoryUrl: string, branch: string) => {
	let { stdout } = await spawn('git', ['ls-remote', repositoryUrl, branch], {
		doNotThrowError: true,
	});
	return stdout.join('').split('\t')[0];
};

let checkoutBranch = async (dir: string, branch: string) => {
	let response = await spawn('git', ['checkout', branch], {
		cwd: dir,
		doNotThrowError: true,
	});
	let stderr = response.stderr.join('').trim();
	if (stderr.match(/did not match any file/)) {
		console.warn(
			`${clc.yellow('WARN')} Branch ${JSON.stringify(branch)} does not exist`,
		);
		await spawn('git', ['checkout', '-b', branch], {
			cwd: dir,
		});
	}
};

export let switchBranch = async (branchName: string) => {
	let repoContext = repositoryContext.getStore();
	invariant(repoContext, 'No repository context found');
	let cwdContext = getCwdContext();

	await checkoutBranch(cwdContext.cwd, branchName);

	let newBranch = await gitBranch(cwdContext.cwd);

	repoContext.branch = newBranch;
	let log = logger(
		`Creating branch: ${repoContext.repository}/tree/${branchName}`,
	);
	log.success();
};

let gitBranch = async (dir: string) => {
	let { stdout } = await spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
		cwd: dir,
	});
	let branch = stdout.join('').trim();
	return branch;
};

export let cloneRepository = async (
	repositoryUrl: string,
	extraName?: string,
) => {
	let tmpDir = await getTmpDir(
		`${repositoryUrl}${extraName ? `-${extraName}` : ''}`,
	);
	let cwd = cwdContext.getStore();
	if (cwd) {
		cwd.cwd = tmpDir;
	}

	if (await isDirectory(tmpDir)) {
		console.log(`Directory ${tmpDir} already exists, skipping clone`);
		let remoteDefaultBranch =
			await getDefaultBranchFromRemote(repositoryUrl);
		let remoteDefaultBranchHash =
			remoteDefaultBranch &&
			(await getBranchHashFromRemote(repositoryUrl, remoteDefaultBranch));
		invariant(
			remoteDefaultBranchHash,
			`No remote default branch hash found in remote ${repositoryUrl}`,
		);
		return remoteDefaultBranch;
	}

	let log = logger(`Cloning repository: ${repositoryUrl} to ${tmpDir}`);
	await spawn('git', ['clone', repositoryUrl, tmpDir]);
	let branch = await gitBranch(tmpDir);
	log.success();
	return branch;
};
