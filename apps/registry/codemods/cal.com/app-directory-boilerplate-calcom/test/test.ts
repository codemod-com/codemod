import { deepStrictEqual, ok } from 'node:assert';
import { buildApi, executeFilemod } from '@codemod-com/filemod';
import { buildPathAPI, buildUnifiedFileSystem } from '@codemod-com/utilities';
import type { DirectoryJSON } from 'memfs';
import { createFsFromVolume, Volume } from 'memfs';
import tsmorph from 'ts-morph';
import { describe, it } from 'vitest';
import { repomod } from '../src/index.js';

const transform = async (json: DirectoryJSON) => {
	const volume = Volume.fromJSON(json);
	const fs = createFsFromVolume(volume);

	const unifiedFileSystem = buildUnifiedFileSystem(fs);
	const pathApi = buildPathAPI('/');

	const api = buildApi<{
		tsmorph: typeof tsmorph;
	}>(
		unifiedFileSystem,
		() => ({
			tsmorph,
		}),
		pathApi,
	);

	return executeFilemod(api, repomod, '/', {}, {});
};

describe('cal.com app-directory-boilerplate-calcom', function () {
	it('should build correct files', async function () {
		const externalFileCommands = await transform({
			'/opt/project/pages/a/index.tsx': 'TODO content',
			'/opt/project/pages/a/embed.tsx': 'TODO content',
			'/opt/project/pages/a/b.tsx': `
			import { getLayout } from './getLayout';
			export default function B(props) {
				return <Component />;
			}
			B.getLayout = getLayout;
			`,
			'/opt/project/pages/a/[b]/c.tsx': `
			export const getServerSideProps = (ctx) => {
				return null;
			}
			export default function C(props) {
				return <Component />;
			}
			`,
			'/opt/project/pages/a/d.tsx': `
			export const getStaticProps = (ctx) => {
				return null;
			}
			export default function C(props) {
				return <Component />;
			}
			`,
		});

		deepStrictEqual(externalFileCommands.length, 10);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path ===
						'/opt/project/app/future/(shared-page-wrapper)/(no-layout)/a/page.tsx',
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path === '/opt/project/pages/a/index.tsx',
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path === '/opt/project/pages/a/embed.tsx',
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path ===
						'/opt/project/app/future/(shared-page-wrapper)/(layout)/a/b/page.tsx',
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path === '/opt/project/pages/a/b.tsx',
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path ===
						'/opt/project/app/future/(individual-page-wrapper)/a/[b]/c/page.tsx',
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path === '/opt/project/pages/a/[b]/c.tsx',
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path ===
						'/opt/project/app/future/(individual-page-wrapper)/a/d/page.tsx',
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === 'upsertFile' &&
					command.path === '/opt/project/pages/a/d.tsx',
			),
		);

		ok(
			externalFileCommands.some((command) => {
				return (
					command.kind === 'upsertFile' &&
					command.path ===
						'/opt/project/app/future/(shared-page-wrapper)/(no-layout)/a/embed/page.tsx' &&
					command.data.replace(/\W/gm, '') ===
						`
            import type { Params } from "next/dist/shared/lib/router/utils/route-matcher";
            import { getData } from "../page";
            
            type PageProps = Readonly<{
                params: Params;
            }>;
            
            const Page = ({ params }: PageProps) => {
                await getData(params, true);
            
                return null;
            };
                
            export default Page;`.replace(/\W/gm, '')
				);
			}),
		);

		ok(
			externalFileCommands.some((command) => {
				return (
					command.kind === 'upsertFile' &&
					command.path ===
						'/opt/project/app/future/(shared-page-wrapper)/(no-layout)/a/page.tsx' &&
					command.data.replace(/\W/gm, '') ===
						`
                import Page from "@pages/a/index";
                import { _generateMetadata } from "app/_utils";

                export const generateMetadata = async () => await _generateMetadata(() => "", () => "");
                export default Page;
            `.replace(/\W/gm, '')
				);
			}),
		);

		ok(
			externalFileCommands.some((command) => {
				return (
					command.kind === 'upsertFile' &&
					command.path === '/opt/project/pages/a/index.tsx' &&
					command.data.replace(/\W/gm, '') ===
						`
                'use client';
                TODO content
                `.replace(/\W/gm, '')
				);
			}),
		);

		ok(
			externalFileCommands.some((command) => {
				return (
					command.kind === 'upsertFile' &&
					command.path ===
						'/opt/project/app/future/(shared-page-wrapper)/(layout)/a/b/page.tsx' &&
					command.data.replace(/\W/gm, '') ===
						`
                import Page from "@pages/a/b";
                import { _generateMetadata } from "app/_utils";
                
                export const generateMetadata = async () => await _generateMetadata(() => "", () => "");
                export default Page;
            `.replace(/\W/gm, '')
				);
			}),
		);

		ok(
			externalFileCommands.some((command) => {
				return (
					command.kind === 'upsertFile' &&
					command.path === '/opt/project/pages/a/b.tsx' &&
					command.data.replace(/\W/gm, '') ===
						`
                'use client';
                import { getLayout } from './getLayout';
                export default function B(props) {
                    return <Component />;
                }
                B.getLayout = getLayout;
                `.replace(/\W/gm, '')
				);
			}),
		);

		ok(
			externalFileCommands.some((command) => {
				const expected = `
					import OldPage from "@pages/a/[b]/c";
					import { _generateMetadata } from "app/_utils";
					import type { Params } from "next/dist/shared/lib/router/utils/route-matcher";
					import PageWrapper from "@components/PageWrapperAppDir";
					import { headers, cookies } from "next/headers";
					import { buildLegacyCtx } from "@lib/buildLegacyCtx";

					export const generateMetadata = async () => await _generateMetadata(() => "", () => "");
					
					type PageProps = Readonly<{
						params: Params;
					}>;

					const Page = async ({ params }: PageProps) => {
						const h = headers();
						const nonce = h.get("x-nonce") ?? undefined;
						
						const legacyCtx = buildLegacyCtx(headers(), cookies(), params);
						const props = await getData(legacyCtx);

						return (
							<PageWrapper requiresLicense={false} nonce={nonce} themeBasis={null}>
								<OldPage {...props} />
							</PageWrapper>
						);
					};
					
					export default Page;`;

				return (
					command.kind === 'upsertFile' &&
					command.path ===
						'/opt/project/app/future/(individual-page-wrapper)/a/[b]/c/page.tsx' &&
					command.data.replace(/\W/gm, '') ===
						expected.replace(/\W/gm, '')
				);
			}),
		);

		ok(
			externalFileCommands.some((command) => {
				return (
					command.kind === 'upsertFile' &&
					command.path === '/opt/project/pages/a/[b]/c.tsx' &&
					command.data.replace(/\W/gm, '') ===
						`
                'use client';
                export const getServerSideProps = (ctx) => {
                    return null;
                }
                export default function C(props) {
                    return <Component />;
                }
                `.replace(/\W/gm, '')
				);
			}),
		);

		ok(
			externalFileCommands.some((command) => {
				const expected = `
					import OldPage from "@pages/a/d";
					import { _generateMetadata } from "app/_utils";
					import type { Params } from "next/dist/shared/lib/router/utils/route-matcher";
					import PageWrapper from "@components/PageWrapperAppDir";
					import { headers, cookies } from "next/headers";
					import { buildLegacyCtx } from "@lib/buildLegacyCtx";

					export const generateMetadata = async () => await _generateMetadata(() => "", () => "");
					
					type PageProps = Readonly<{
						params: Params;
					}>;

					const Page = async ({ params }: PageProps) => {
						const h = headers();
						const nonce = h.get("x-nonce") ?? undefined;
						
						const legacyCtx = buildLegacyCtx(headers(), cookies(), params);
						const props = await getData(legacyCtx);

						return (
							<PageWrapper requiresLicense={false} nonce={nonce} themeBasis={null}>
								<OldPage {...props} />
							</PageWrapper>
						);
					};
					
					export default Page;`;
				return (
					command.kind === 'upsertFile' &&
					command.path ===
						'/opt/project/app/future/(individual-page-wrapper)/a/d/page.tsx' &&
					command.data.replace(/\W/gm, '') ===
						expected.replace(/\W/gm, '')
				);
			}),
		);

		ok(
			externalFileCommands.some((command) => {
				return (
					command.kind === 'upsertFile' &&
					command.path === '/opt/project/pages/a/d.tsx' &&
					command.data.replace(/\W/gm, '') ===
						`
                'use client';
                export const getStaticProps = (ctx) => {
                    return null;
                }
                export default function C(props) {
                    return <Component />;
                }
                `.replace(/\W/gm, '')
				);
			}),
		);
	});

	it('should insert router segment config and server-side data hooks to the future page', async function () {
		const [upsertPageCommand] = await transform({
			'/opt/project/pages/a/index.tsx': `
			import C from 'C';
			import { a } from 'a';
			import b from 'b';

			export const getServerSideProps = (ctx) => {
				return a + b;
			}
			
			const getData = () => {
				getServerSideProps();
			}

			export default function P() {
				return <C />;
			}

			export const dynamic="force-dynamic";
			`,
		});

		deepStrictEqual(upsertPageCommand?.kind, 'upsertFile');
		deepStrictEqual(
			upsertPageCommand?.path,
			'/opt/project/app/future/(individual-page-wrapper)/a/page.tsx',
		);

		deepStrictEqual(
			upsertPageCommand?.data.replace(/(?!\.)\s/gm, ''),
			`import OldPage from "@pages/a/index";
			import {_generateMetadata} from "app/_utils";
			import type {Params} from "next/dist/shared/lib/router/utils/route-matcher";
			import PageWrapper from "@components/PageWrapperAppDir";
			import {headers, cookies} from "next/headers";
			import { buildLegacyCtx } from "@lib/buildLegacyCtx";

			import b from 'b'; 
			import { a } from 'a';
			const getServerSideProps = (ctx) => {
				return a + b;
			}
			const getData = () => {
				getServerSideProps();
			} 

			export const generateMetadata = async ()=> await _generateMetadata(()=>"",()=>"");
			type PageProps=Readonly<{params:Params;}>;
			const Page = async ({params}:PageProps)=>{
				const h=headers();
				const nonce=h.get("x-nonce") ?? undefined;

				const legacyCtx = buildLegacyCtx(headers(), cookies(), params);
				const props = await getData(legacyCtx);
				
				return(<PageWrapper requiresLicense={false} nonce={nonce }themeBasis={null}><OldPage {...props}/></PageWrapper>);
			};
			export default Page;
			export const dynamic="force-dynamic";
			`.replace(/(?!\.)\s/gm, ''),
		);
	});

	it('should not insert "use client" directive twice', async function () {
		const [, upsertLegacyPage] = await transform({
			'/opt/project/pages/a/index.tsx': `
			'use client'
			import C from 'C';

			export default function P() {
				return <C />;
			}

			`,
		});

		deepStrictEqual(upsertLegacyPage?.kind, 'upsertFile');
		deepStrictEqual(
			upsertLegacyPage?.path,
			'/opt/project/pages/a/index.tsx',
		);

		deepStrictEqual(
			upsertLegacyPage?.data.replace(/(?!\.)\s/gm, ''),
			`'use client'
			import C from 'C';

			export default function P() {
				return <C />;
			}
			`.replace(/(?!\.)\s/gm, ''),
		);
	});
});
