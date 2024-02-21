#!/usr/bin/env node
import { writeFile } from "fs/promises";
import * as yaml from "js-yaml";
import { simpleGit } from "simple-git";
import { any, parse as valibotParse, record } from "valibot";
import { convertToYaml, parse } from "./parse.js";

const findKeyLineRange = (yaml: string, key: string) => {
	const splitYaml = yaml.split("\n");

	let fieldStartLine: number | null = null;
	let fieldEndLine: number | null = null;
	let startFound = false;

	for (const [index, line] of splitYaml.entries()) {
		if (startFound && /^[A-Za-z0-9_-]+:\s/.test(line)) {
			fieldEndLine = index;
			break;
		}

		if (new RegExp(`^${key}:\\s`).test(line)) {
			fieldStartLine = index;
			startFound = true;
		}
	}

	if (fieldStartLine === null) {
		return null;
	}

	if (fieldEndLine === null) {
		fieldEndLine = splitYaml.length - 1;
	}

	return [fieldStartLine, fieldEndLine] as const;
};

export const sync = async () => {
	const git = simpleGit();

	await git.addRemote("website", "https://github.com/codemod-com/website.git");
	await git.addConfig("user.email", "auto@codemod.com", false, "local");
	await git.addConfig("user.name", "codemod.com", false, "local");

	await git.fetch(["website", "main"]);
	await git.fetch(["origin", "main", "--depth=2"]);

	const diff = await git.diff(["--name-only", "origin/main~1"]);
	const readmesChanged = diff
		.split("\n")
		.filter((path) => path.match(/.*\/codemods\/.*README\.md$/));

	if (!readmesChanged.length) {
		console.log("No READMEs changed. Exiting.");
		process.exit(0);
	}

	const staged: Record<string, string> = {};
	for (const path of readmesChanged) {
		console.log(`Syncing ${path}`);
		const [migratingFrom, migratingTo, ...rest] = path.split("/").slice(3, -1);

		let generatedSlug = migratingFrom;

		if (migratingTo) {
			const joint = migratingTo.match(/^\d+(\.\d+)*$/) ? "-" : "-to-";
			const leftoverParts = rest.length ? `-${rest.join("-")}` : "";

			generatedSlug = `${migratingFrom}${joint}${migratingTo}${leftoverParts}`;
		}

		const websitePath = `cms/automations/${generatedSlug}.md`;

		let websiteFile: string | null;
		let oldFile: string | null;
		let newFile: string | null;
		try {
			websiteFile = await git.catFile(["-p", `website/main:${websitePath}`]);
		} catch (err) {
			websiteFile = null;
		}

		try {
			oldFile = await git.catFile(["-p", `origin/main~1:${path}`]);
		} catch (err) {
			oldFile = null;
		}

		try {
			newFile = await git.catFile(["-p", `origin/main:${path}`]);
		} catch (err) {
			newFile = null;
		}

		if (!newFile) {
			console.error(`File was deleted in HEAD: ${path}`);
			continue;
		}

		let parsedNewFile: ReturnType<typeof parse>;
		try {
			parsedNewFile = parse(newFile);
		} catch (err) {
			console.error(`Could not parse new README file under ${path}`);
			continue;
		}
		const newFileShortDescription = parsedNewFile.description.split("\n").at(0);
		const newReadmeYamlContent = convertToYaml(parsedNewFile, path);

		// If !websiteFile, we just add the file
		// If websiteFile is present, but oldFile is not, this means that
		// the website somehow had that file prior to codemod being added to the registry,
		// which technically should not be possible.
		// In that case we just update the entire file with the new one anyways.
		if (!websiteFile || !oldFile) {
			staged[websitePath] =
				`---\n${newReadmeYamlContent}\n---\n${newFileShortDescription}`;
			continue;
		}

		// Otherwise:
		// 1. Perform a diff between old file and new file, decide what do we need to filter
		// 2. Iterate over filtered fields that have changed between commits
		// 3. If the field's version from old readme is different from website, we remove it from update list
		// 4. Otherwise, proceed and add update the fields in the object, based on website version
		// 5. Commit the file

		const websiteContentSplit = websiteFile.split("---", 3);

		const websiteYamlContent = websiteContentSplit.at(1)?.trim();

		if (!websiteYamlContent) {
			console.error(`Could not parse website file ${websitePath}`);
			process.exit(1);
		}

		// Here, we are actually doing double-convert, json->yaml->json, but it's meant to be that way.
		// Our content's source of truth is yaml from the beginning, plus it has a lot of multi-line strings,
		// which would be a pain to handle in json. We are converting to json, just to be able to operate
		// the fields just like any other JS object, to perform the comparison.
		// Not using valibot's safeParse, because we can just error if that's not an object and we don't care
		// about the fields to be of a specific type.
		let oldFileParsedYaml: unknown;
		try {
			oldFileParsedYaml = yaml.load(convertToYaml(parse(oldFile), path));
		} catch (err) {
			console.error(`Could not parse old README file under ${path}`);
			continue;
		}
		const oldContent = valibotParse(record(any()), oldFileParsedYaml);
		const newContent = valibotParse(
			record(any()),
			yaml.load(newReadmeYamlContent),
		);
		const websiteContent = valibotParse(
			record(any()),
			yaml.load(websiteYamlContent),
		);

		const changedKeys: string[] = [];
		for (const key of Object.keys(newContent)) {
			// Field did not change
			if (oldContent[key] === newContent[key]) {
				continue;
			}

			// Field was changed in the CMS, no update
			if (oldContent[key] !== websiteContent[key]) {
				continue;
			}

			// Field is already the same as in the new README version
			if (newContent[key] === websiteContent[key]) {
				continue;
			}

			changedKeys.push(key);
		}

		if (!changedKeys.length) {
			console.log(`Nothing to update in path ${path}`);
			continue;
		}

		// Also update the updated-on field
		changedKeys.push("updated-on");
		// Yaml to be updated on each iteration serving as a target to make replacements in
		let updatedYaml = websiteYamlContent;
		const newFileLines = newReadmeYamlContent.split("\n");

		for (const key of changedKeys) {
			const websiteRange = findKeyLineRange(updatedYaml, key);
			if (!websiteRange) {
				console.error(`Could not find ${key} in website file ${websitePath}`);
				process.exit(1);
			}

			const newFileRange = findKeyLineRange(newReadmeYamlContent, key);
			if (!newFileRange) {
				console.error(`Could not find ${key} in new file ${path}`);
				process.exit(1);
			}

			const [websiteStartIndex, websiteEndIndex] = websiteRange;
			const [newFileStartIndex, newFileEndIndex] = newFileRange;

			// Use the latest version of yaml that's being updated
			const websiteLines = updatedYaml.split("\n");

			updatedYaml = [
				...websiteLines.slice(0, websiteStartIndex),
				...newFileLines.slice(newFileStartIndex, newFileEndIndex),
				...websiteLines.slice(websiteEndIndex),
			].join("\n");
		}

		const websiteLeftoverDescription = websiteContentSplit.at(2)?.trim();
		updatedYaml = `---\n${updatedYaml}\n---\n${
			websiteLeftoverDescription ?? newFileShortDescription
		}`;

		staged[websitePath] = updatedYaml;
	}

	if (Object.keys(staged).length === 0) {
		console.log("No commits were created. Skipping push...");
		process.exit(0);
	}

	await git.checkout(["-b", "update-codemods", "website/main"]);

	for (const [websitePath, newContent] of Object.entries(staged)) {
		await writeFile(websitePath, newContent);
		await git.add(websitePath);
		await git.commit(`Syncs ${websitePath} from codemod-registry`);
		console.log(`Created commit for ${websitePath}`);
	}

	await git.push("website", "HEAD:main");
	console.log("Successfully pushed to website repo");

	process.exit(0);
};

sync();
