import { parse, sep } from 'node:path';
import type { Filemod, HandleData, HandleFile } from '@codemod-com/filemod';

export let buildData = (appPath: string) => `
	import { expect } from "@playwright/test";

	import { test } from "../lib/fixtures";
	import { metadataCommons } from "../lib/metadata";
	
	test.describe("Metadata of ${appPath}", () => {
		test.afterEach(async ({ users }) => {
			await users.deleteAll();
		});
	
		test("emits proper metadata", async ({ page, users }) => {
			const user = await users.create();
			await user.apiLogin();
			await page.goto("${appPath}");
						
			expect(await metadataCommons.getTitle(page)).toMatch(/(TODO|Cal\.com) \| Cal\.com/);
		
			expect(await metadataCommons.getCanonicalLinkHref(page)).toEqual("http://localhost:3000/${appPath}");
		
			expect(await metadataCommons.getAppleTouchIconHref(page)).toEqual("/api/logo?type=apple-touch-icon");
		
			expect(await metadataCommons.getManifestHref(page)).toEqual("/site.webmanifest");
		
			expect(await metadataCommons.getMaskIconHref(page)).toEqual("/safari-pinned-tab.svg");
			expect(await metadataCommons.getMaskIconColor(page)).toEqual("#000000");
		
			expect(await metadataCommons.getLink16Href(page)).toEqual("/api/logo?type=favicon-16");
		
			expect(await metadataCommons.getLink32Href(page)).toEqual("/api/logo?type=favicon-32");
		
			expect(await metadataCommons.getViewportContent(page)).toEqual(
			"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
			);
		
			expect(await metadataCommons.getRobotsContent(page)).toEqual("index,follow");
		
			expect(await metadataCommons.getTileColorContent(page)).toEqual("#ff0000");
		
			expect(await metadataCommons.getLightSchemeName(page)).toEqual("theme-color");
		
			expect(await metadataCommons.getLightSchemeContent(page)).toEqual("#f9fafb");
		
			expect(await metadataCommons.getDarkSchemeName(page)).toEqual("theme-color");
		
			expect(await metadataCommons.getDarkSchemeContent(page)).toEqual("#1C1C1C");
		
			expect(await metadataCommons.getTwitterCardContent(page)).toEqual("summary_large_image");
		
			expect(await metadataCommons.getTwitterSiteContent(page)).toEqual("@calcom");
		
			expect(await metadataCommons.getTwitterAuthorContent(page)).toEqual("@calcom");
		
			expect(await metadataCommons.getOgDescriptionContent(page)).toEqual("TODO");
		
			expect(await metadataCommons.getOgUrlContent(page)).toEqual("http://localhost:3000/${appPath}");
		
			expect(await metadataCommons.getOgTypeContent(page)).toEqual("website");
		
			expect(await metadataCommons.getOgSiteNameContent(page)).toEqual("Cal.com");
		
			expect(await metadataCommons.getOgTitleContent(page)).toMatch(/(TODO|Cal\.com) \| Cal\.com/);
		
			expect(
			(await metadataCommons.getOgImageContent(page))?.startsWith(
				"http://localhost:3000/_next/image?w=1200&q=100&url="
			)
			).toBeTruthy();
		});
	});
`;

type Dependencies = Record<string, never>;

type State = {
	testPath: string | null;
};

let initializeState: Filemod<Dependencies, State>['initializeState'] = async (
	options,
) => ({
	testPath: typeof options.testPath === 'string' ? options.testPath : null,
});

let handleFile: HandleFile<Dependencies, State> = async (
	api,
	path,
	options,
	state,
) => {
	if (state === null || state.testPath === null) {
		return [];
	}

	let parsedPath = parse(path);
	let directoryNames = parsedPath.dir.split(sep);
	let endsWithPages =
		directoryNames.length > 0 &&
		directoryNames.lastIndexOf('pages') === directoryNames.length - 1;

	let nameIsIndex = parsedPath.name === 'index';

	if (endsWithPages && nameIsIndex) {
		return [];
	}

	let pagesIndex = directoryNames.lastIndexOf('pages');

	let paths = directoryNames.slice(pagesIndex + 1);

	if (!nameIsIndex) {
		paths.push(parsedPath.name);
	}

	let appPath = api.joinPaths(...paths);

	paths[paths.length - 1] += '.e2e.ts';

	let newPath = api.joinPaths(state.testPath, ...paths);

	return [
		{
			kind: 'upsertFile',
			path: newPath,
			options: {
				...options,
				appPath,
			},
		},
	];
};

let handleData: HandleData<Dependencies, State> = async (
	_,
	path,
	__,
	options,
) => {
	let appPath = typeof options.appPath === 'string' ? options.appPath : null;

	if (appPath === null) {
		return { kind: 'noop' };
	}

	return {
		kind: 'upsertData',
		path,
		data: buildData(appPath),
	};
};

export let repomod: Filemod<Dependencies, State> = {
	includePatterns: ['**/pages/**/*.{js,jsx,ts,tsx}'],
	excludePatterns: ['**/node_modules/**', '**/pages/api/**'],
	initializeState,
	handleFile,
	handleData,
};
