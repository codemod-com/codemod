/* DO NOT LOG ANYTHING. IT WILL BE APPENDED TO THE TOP OF THE GENERATED STRING */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import * as nodePath from 'node:path';
import type { Heading, PhrasingContent, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { is, object, optional, string } from 'valibot';

const configJsonSchema = object({
	schemaVersion: optional(string()),
	name: optional(string()),
	engine: string(),
});

const UNESCAPED = ['inlineCode', 'link'];

const noFirstLetterLowerCase = (str: string) =>
	str.length ? str[0] + str.slice(1).toLowerCase() : str;

const capitalize = (str: string) =>
	str[0] ? str[0].toUpperCase() + str.slice(1) : str;

// TODO:
// const getStyledValue = (node) => {};

const getTextFromNode = (
	node: RootContent | PhrasingContent | null,
	style = false,
): string | null => {
	if (!node) {
		return null;
	}

	if ('value' in node) {
		if (node.type === 'inlineCode') {
			return `\`${node.value}\``;
		}

		return node.value;
	}

	if ('children' in node) {
		let textContent = '';
		for (const child of node.children) {
			if (!style) {
				textContent += getTextFromNode(child, style);
				continue;
			}

			if (node.type === 'strong') {
				textContent += `**${getTextFromNode(child, style)}**`;
			} else {
				textContent += getTextFromNode(child, style);
			}
		}

		return textContent;
	}

	return null;
};

const getUrlFromNode = (
	node: RootContent | PhrasingContent | null,
): string | null => {
	if (!node) {
		return null;
	}

	if ('url' in node) {
		return node.url;
	}

	if ('children' in node) {
		return getUrlFromNode(node.children[0] ?? null);
	}

	return null;
};

const getHeading = (
	rootContents: ReadonlyArray<RootContent>,
	depth: 1 | 2 | 3,
	name: string | null,
): Heading | null => {
	for (const rootContent of rootContents) {
		if (rootContent.type !== 'heading') {
			continue;
		}

		if (name !== null) {
			const headerTitle = getTextFromNode(rootContent);

			if (
				!headerTitle ||
				!noFirstLetterLowerCase(headerTitle).startsWith(
					noFirstLetterLowerCase(name),
				)
			) {
				continue;
			}
		}

		if (rootContent.depth === depth) {
			return rootContent;
		}
	}

	return null;
};

const getTextByHeader = (
	rootContents: ReadonlyArray<RootContent>,
	heading: Heading,
	delimiter: string,
) => {
	const headerIndex = rootContents.findIndex(
		(rc) => rc.position?.start.line === heading.position?.start.line,
	);
	const nextHeaderIndex = rootContents.findIndex(
		(rc) =>
			rc.type === 'heading' &&
			rc.position?.start.line &&
			heading.position?.start.line &&
			rc.position?.start.line > heading.position?.start.line &&
			rc.depth === heading.depth,
	);

	const contentParts = rootContents.slice(
		headerIndex + 1,
		nextHeaderIndex > -1 ? nextHeaderIndex : undefined,
	);

	const textParts: string[] = [];

	for (const rc of contentParts) {
		if ('children' in rc) {
			rc.children
				.map((child, idx, arr) => {
					const isDescription =
						getTextFromNode(heading)?.includes('Description');

					const isLinks = getTextFromNode(heading)?.includes('Links');

					// Preserve ### on higher-depth headings
					if (
						rc.type === 'heading' &&
						rc.depth > heading.depth &&
						idx === 0 &&
						(child.type === 'text' ||
							child.type === 'inlineCode' ||
							child.type === 'strong')
					) {
						const conditionalDelimiter = delimiter.repeat(
							isDescription ? 2 : 1,
						);
						return `${conditionalDelimiter}${'#'.repeat(
							rc.depth,
						)} ${getTextFromNode(
							child,
							true,
						)}${conditionalDelimiter}`;
					}

					if (child.type === 'inlineCode') {
						return `\`${child.value}\``;
					}

					if (child.type === 'text') {
						const nextEl = arr[idx + 1];
						if (nextEl && UNESCAPED.includes(nextEl.type)) {
							return child.value;
						}

						return `${child.value}${delimiter}`;
					}

					if (child.type === 'listItem') {
						if (isDescription) {
							return `  -   ${getTextFromNode(
								child.children[0] ?? null,
								true,
							)}${delimiter}`;
						}

						if (isLinks) {
							return `${getUrlFromNode(
								child.children[0] ?? null,
							)}${delimiter}`;
						}

						return `${getTextFromNode(
							child.children[0] ?? null,
						)}${delimiter}`;
					}

					if (child.type === 'link') {
						if (isDescription) {
							return `[${getTextFromNode(
								child.children[0] ?? null,
								true,
							)}](${getUrlFromNode(child ?? null)})`;
						}

						return getTextFromNode(
							child.children[0] ?? null,
							isDescription,
						);
					}

					if (child.type === 'strong') {
						return getTextFromNode(child.children[0] ?? null);
					}

					// Do not add new line after certain blocks (treated as separate AST nodes)
					if (UNESCAPED.includes(child.type)) {
						return getTextFromNode(child);
					}

					return null;
				})
				.forEach((child) => {
					if (child !== null) {
						textParts.push(child);
					}
				});
		}

		if ('value' in rc) {
			if (rc.type === 'code') {
				textParts.push(`\n\`\`\`${rc.lang}\n\n${rc.value}\n\n\`\`\`\n`);
			} else {
				textParts.push(`${rc.value}${delimiter}`);
			}
		}
	}

	// Trim last el to remove delimiter
	textParts[textParts.length - 1] =
		textParts.at(-1)?.replace(new RegExp(`${delimiter}$`), '') ?? '';

	return textParts.join('');
};

export const parse = (data: string) => {
	const { children } = fromMarkdown(data);

	const nameHeading = getHeading(children, 1, null);
	const name =
		nameHeading?.children[0] && 'value' in nameHeading.children[0]
			? nameHeading.children[0].value
			: null;

	if (!name) {
		throw new Error('Name not found');
	}

	const descHeading = getHeading(children, 2, 'Description');
	const description = descHeading
		? getTextByHeader(children, descHeading, '\n')
		: null;
	if (!description) {
		throw new Error('Description not found');
	}

	const exampleHeading = getHeading(children, 2, 'Example');
	const examples = exampleHeading
		? getTextByHeader(children, exampleHeading, '\n')
		: null;
	// if (!examples) {
	// 	throw new Error('Examples not found');
	// }

	const applicabilityHeader = getHeading(children, 2, 'Applicability');
	const applicability = applicabilityHeader
		? getTextByHeader(children, applicabilityHeader, '\n')
		: null;
	if (!applicability) {
		throw new Error('Applicability criteria not found');
	}
	// This should be enforced for future codemods. For now, validation should be disabled.
	// if (!applicability.match(/[\w]+ (>|>=) \d+\.\d+\.\d+/)) {
	// 	throw new Error('Applicability criteria is of a wrong format');
	// }

	const versionHeader = getHeading(children, 3, 'Codemod Version');
	const version = versionHeader
		? getTextByHeader(children, versionHeader, '\n')
		: null;
	if (!version) {
		throw new Error('Codemod version not found');
	}
	const versionMatch = version.match(/(v)?(\d+\.\d+\.\d+)/)?.at(2);

	const changeModeHeader = getHeading(children, 3, 'Change Mode');
	const changeModeText = changeModeHeader
		? getTextByHeader(children, changeModeHeader, '\n').toLowerCase()
		: null;
	if (!changeModeText) {
		throw new Error('Change mode not found');
	}
	let changeMode: string | null = null;
	if (changeModeText.includes('assistive')) {
		changeMode = 'assistive';
	} else if (changeModeText.includes('autonomous')) {
		changeMode = 'autonomous';
	}
	if (!changeMode) {
		throw new Error('Change mode is of a wrong format');
	}

	const engineHeader = getHeading(children, 3, 'Codemod Engine');
	const engineText = engineHeader
		? getTextByHeader(children, engineHeader, '\n')
		: null;
	if (!engineText) {
		throw new Error('Codemod engine not found');
	}
	let engine: string | null = null;
	if (engineText.includes('ts-morph')) {
		engine = 'ts-morph';
	} else if (engineText.includes('jscodeshift')) {
		engine = 'jscodeshift';
	} else if (engineText.toLowerCase().includes('file')) {
		engine = 'filemod';
	}
	if (!engine) {
		throw new Error('Codemod engine is of a wrong format');
	}

	const timeSaveHeader = getHeading(children, 3, 'Estimated Time Saving');
	const timeSave = timeSaveHeader
		? getTextByHeader(children, timeSaveHeader, '\n').replace(' per ', '/')
		: null;
	if (!timeSave) {
		throw new Error('Estimated time saving not found');
	}

	const ownerHeader = getHeading(children, 3, 'Owner');
	const owner = ownerHeader
		? getTextByHeader(children, ownerHeader, '\n') ?? 'Codemod.com'
		: null;

	const linksHeader = getHeading(children, 3, 'Links');
	const links = linksHeader
		? getTextByHeader(children, linksHeader, ',')
		: null;

	return {
		name,
		description,
		examples,
		applicability,
		version: versionMatch,
		changeMode,
		engine,
		timeSave,
		owner,
		links,
	};
};

export const convertToYaml = (
	data: ReturnType<typeof parse>,
	path?: string,
) => {
	const {
		name: title,
		description,
		examples,
		applicability,
		changeMode,
		engine,
		timeSave,
		owner,
	} = data;

	let slug: string | null = null;
	let framework: string | null = null;
	let frameworkVersion: string | null = null;
	let cliCommand: string | null = null;
	let cleanPath: string | null = null;
	let codemodName: string | null = null;
	if (path) {
		const splitPath = path.split('/');
		cleanPath = splitPath.slice(0, -1).join('/');

		const parts = __dirname.split('/');
		const pivot = parts.indexOf('readme-parser');
		const pathToCodemod = nodePath.join(
			parts.slice(0, pivot).join('/'),
			cleanPath,
		);

		framework = splitPath.at(1) ?? null;
		frameworkVersion = splitPath.at(2) ?? null;

		try {
			const config = readFileSync(
				`${pathToCodemod}/config.json`,
			).toString();
			const json = JSON.parse(config);
			codemodName = json.name ?? cleanPath.split('/').slice(1).join('/');

			if (is(configJsonSchema, json)) {
				slug = codemodName!.replace(/\//g, '-');
				cliCommand = `intuita ${codemodName}`;
			}
		} catch (e) {
			/* empty */
		}
	}

	let vscodeHashDigest: string | null = null;
	if (codemodName) {
		vscodeHashDigest = createHash('ripemd160')
			.update(codemodName)
			.digest('base64url');
	}

	let titleWithVersion = title;
	if (framework) {
		if (frameworkVersion) {
			titleWithVersion = `${framework} V${frameworkVersion} - ${title}`;
		} else {
			titleWithVersion = `${framework} - ${title}`;
		}
	}
	titleWithVersion = capitalize(titleWithVersion);

	const shortDescription = description
		.split('\n')
		.at(0)
		?.split('.')
		.at(0)
		?.replace('`', '')
		.replace(/\W$/g, '');

	const res = `
created-on: ${new Date().toISOString()}
f_long-description: >-
  ## Description
  \n
  ${description.replace(/\n/g, '\n  ')}
  ${examples ? `\n\n  ${examples.replace(/\n/g, '\n  ')}` : ''}${
		path
			? `\nf_github-link: https://github.com/codemod-com/codemod/tree/main/apps/registry/${cleanPath}`
			: ''
  }${
		vscodeHashDigest
			? `\nf_vs-code-link: vscode://intuita.intuita-vscode-extension/showCodemod?chd=${vscodeHashDigest}`
			: ''
  }${cliCommand ? `\nf_cli-command: ${cliCommand}` : ''}${
		framework ? `\nf_framework: cms/framework/${framework}.md` : ''
  }
f_applicability-criteria: "${applicability}"
f_verified-codemod: ${owner === 'Codemod.com' ? 'true' : 'false'}
f_author: ${
		owner === 'Codemod.com'
			? 'cms/authors/codemod-com.md'
			: `cms/authors/${owner?.toLowerCase().replace(/ /g, '-') ?? ''}.md`
	}
layout: "[automations].html"${slug ? `\nslug: ${slug}` : ''}
title: ${capitalize(titleWithVersion)}${slug ? `\nf_slug-name: ${slug}` : ''}
f_codemod-engine: cms/codemod-engines/${engine}.md
f_change-mode-2: ${capitalize(changeMode)}
f_estimated-time-saving: ${
		timeSave.includes('\n')
			? `>-\n  ${timeSave.replace(/\n/, '\n  ')}`
			: `"${timeSave}"`
	}
tags: automations
updated-on: ${new Date().toISOString()}
published-on: ${new Date().toISOString()}
seo:
  title: ${titleWithVersion} | Codemod.com Automations
  og:title: ${titleWithVersion} | Codemod.com Automations
  twitter:title: ${titleWithVersion} | Codemod.com Automations
  description: ${shortDescription}
  twitter:card: ${shortDescription}
`.trim();

	return res;
};
