import assert, { deepStrictEqual } from 'node:assert';
import { buildApi, executeFilemod } from '@codemod-com/filemod';
import { buildPathAPI, buildUnifiedFileSystem } from '@codemod-com/utilities';
import jscodeshift from 'jscodeshift';
import type { DirectoryJSON } from 'memfs';
import { Volume, createFsFromVolume } from 'memfs';
import { describe, it } from 'vitest';
import { transform as jscodeshiftTransform, repomod } from '../src/index.js';

let globalOptions = {
	buildLegacyCtxUtilAbsolutePath: '/opt/project/hooks/buildLegacyCtx.tsx',
};

let transform = async (json: DirectoryJSON) => {
	let volume = Volume.fromJSON(json);

	let fs = createFsFromVolume(volume);

	let unifiedFileSystem = buildUnifiedFileSystem(fs);
	let pathApi = buildPathAPI('/');

	let api = buildApi<{
		jscodeshift: typeof jscodeshift;
	}>(
		unifiedFileSystem,
		() => ({
			jscodeshift,
		}),
		pathApi,
	);

	return executeFilemod(api, repomod, '/', globalOptions, {});
};

describe('next 13 remove-get-static-props', () => {
	it('should build correct file', async () => {
		let A_CONTENT = `
		export async function getServerSideProps(ctx) {
			const users = await promise;
			return { props: { users } };
		}

		export default function Component({ users }) {
			return users.map(user => <b>user</b>)
		}
		`;

		let [upsertBuildLegacyCtxUtilCommand, upsertFileCommand] =
			await transform({
				'/opt/project/pages/a.tsx': A_CONTENT,
			});

		let expectedResult = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetServerSidePropsContext } from "next";
		
		type Params = {
			[key: string]: string | string[] | undefined
		};

		type PageProps = {
				params: Params
		};

		export async function getServerSideProps(ctx) {
			const users = await promise;
			return { props: { users } };
		}

		async function getData(ctx: GetServerSidePropsContext) {
			const users = await promise;
			return { users };
		}
			
		export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
			const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
			const { users } = await getData(legacyCtx);

			return users.map(user => <b>user</b>)
		}
		`;

		deepStrictEqual(upsertBuildLegacyCtxUtilCommand?.kind, 'upsertFile');
		deepStrictEqual(
			upsertBuildLegacyCtxUtilCommand.path,
			'/opt/project/hooks/buildLegacyCtx.tsx',
		);

		deepStrictEqual(upsertFileCommand?.kind, 'upsertFile');
		deepStrictEqual(upsertFileCommand.path, '/opt/project/pages/a.tsx');

		deepStrictEqual(
			upsertFileCommand.data.replace(/\s/gm, ''),
			expectedResult.replace(/\s/gm, ''),
		);
	});

	it('should not remove anything if getStaticProps', () => {
		let INPUT = `
			export default function Component() {
	          }
	      `;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(actualOutput, undefined);
	});

	it('should create an additional function if getStaticProps is present', () => {
		let INPUT = `
			export async function getStaticProps() {
				const users = await promise;

				return { props: { users } };
			}

			export default function Component({ users }) {
				return users.map(user => <b>user</b>)
	          }
	      `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
		type Params = {
			[key: string]: string | string[] | undefined
		};

		type PageProps = {
				params: Params
		};
		
			export async function getStaticProps() {
				const users = await promise;

				return { props: { users } };
			}

			async function getData(
				props: GetStaticPropsContext
		) {
				const users = await promise;

				return { users };
		}

			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const {users} = await getData(legacyCtx);

				return users.map(user => <b>user</b>)
			}
			
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should create an additional function if getStaticProps returns an Identifier', () => {
		let INPUT = `
			export async function getStaticProps(context: GetStaticPropsContext) {
				const users = await promise(context.params);
				const res = { props: { users } };
				return res;
			}
			export default function Component({ users }) {
				return users.map(user => <b>user</b>)
			}
	      `;

		let OUTPUT = `
			import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
			import { headers, cookies } from "next/headers";	
			import { GetStaticPropsContext } from "next";
			import { notFound, redirect } from "next/navigation";

			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};

			export async function getStaticProps(context: GetStaticPropsContext) {
				const users = await promise(context.params);
				const res = { props: { users } };
				return res;
			}

			const getData =  async (ctx: GetStaticPropsContext) => {
				const result = await getStaticProps(ctx);
				
				if("redirect" in result) {
						redirect(result.redirect.destination);
				}
				
				if("notFound" in result) {
						notFound();
				}
				
				return "props" in result ? result.props : {};
			}

			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const {users} = await getData(legacyCtx);

				return users.map(user => <b>user</b>)
			}
			
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should replace props nested props properly', () => {
		let INPUT = `
			export async function getStaticProps() {
				const allPosts = await promise;
				return { props: { allPosts } };
			}

			export default function Component({ allPosts: { edges }}) {
			return edges.map(edge => <b>edge</b>)
	          }
	      `;

		let OUTPUT = `
			import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
			import { headers, cookies } from "next/headers";	
			import { GetStaticPropsContext } from "next";
		
			type Params = {
				[key: string]: string | string[] | undefined
			};
	
			type PageProps = {
					params: Params
			};
			
			export async function getStaticProps() {
				const allPosts = await promise;
				return { props: { allPosts } };
			}

			async function getData(props: GetStaticPropsContext) {
				const allPosts = await promise;
				return  { allPosts };
			}

			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const { allPosts: { edges } } = await getData(legacyCtx);

				return edges.map(edge => <b>edge</b>)
			}
			
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should create additional functions if getStaticProps is present', () => {
		let INPUT = `
			export async function getStaticProps() {
				const users = await promise;
				const groups = await anotherPromise;

				return { props: { users, groups }, revalidate: 1 };
			}

			export default function Component({ users, groups }) {
				return [...users, ...groups].map(obj => <b>{obj}</b>)
	          }
	      `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};

			export async function getStaticProps() {
				const users = await promise;
				const groups = await anotherPromise;

				return { props: { users, groups }, revalidate: 1 };
			}
			
			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				const groups = await anotherPromise;

				return { users, groups };
			}

			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const {users, groups } = await getData(legacyCtx);

				return [...users, ...groups].map(obj => <b>{obj}</b>)
			}

			export const revalidate = 1;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should inject data fetching function when props are not destructured', () => {
		let INPUT = `
			export async function getStaticProps() {
				const users = await promise;
				return { props: { users } };
			}

			function SingleAppPage(props: inferSSRProps<typeof getStaticProps>) {
					return null;
			}
			
			export default SingleAppPage;
			
	    `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};

			export async function getStaticProps() {
				const users = await promise;
				return { props: { users } };
			}
			
			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				return { users };
			}

			async function SingleAppPage({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const props = await getData(legacyCtx);
				return null;
			}

			export default SingleAppPage;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should inject data fetching function when export keyword is used', () => {
		let INPUT = `
			export async function getStaticProps() {
				return { props: { a } };
			}

			export function SingleAppPage(props: inferSSRProps<typeof getStaticProps>) {
					return null;
			}
			
			export default SingleAppPage;
			
	    `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
				params: Params
			};

			export async function getStaticProps() {
				return { props: { a } };
			}

			async function getData(props: GetStaticPropsContext) {
				return { a } ;
			}
			
			export async function SingleAppPage({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const props = await getData(legacyCtx);
				return null;
			}

			export default SingleAppPage;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should inject data fetching function when export keyword is used 2', () => {
		let INPUT = `
			export async function getStaticProps() {
				return { props: { a } };
			}

			export const SingleAppPage = (props: inferSSRProps<typeof getStaticProps>) => {
					return null;
			}
			
			export default SingleAppPage;
	    `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};
	
			type PageProps = {
					params: Params
			};

			export async function getStaticProps() {
				return { props: { a } };
			}

			async function getData(props: GetStaticPropsContext) {
				return { a } ;
			}
			
			export const SingleAppPage = async ({ params: pageParams, searchParams: pageSearchParams }: PageProps) => {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const props = await getData(legacyCtx);
				return null;
			}

			export default SingleAppPage;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should inject data fetching function when Page has 0 args', () => {
		let INPUT = `
			export async function getStaticProps() {
				sideEffect();
				return { props: { a } };
			}

			export const SingleAppPage = () => {
					return null;
			}
			
			export default SingleAppPage;
			
	    `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};

			export async function getStaticProps() {
				sideEffect();
				return { props: { a } };
			}
			
			async function getData(props: GetStaticPropsContext) {
				sideEffect();
				return { a } ;
			}

			export const SingleAppPage = async ({ params: pageParams, searchParams: pageSearchParams }: PageProps) => {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				await getData(legacyCtx);
				return null;
			}
			
			export default SingleAppPage;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should inject data fetching function when Page component has implicit return', () => {
		let INPUT = `
			export async function getStaticProps() {
				const users = await promise;
				return { props: { users } };
			}

			const Home = ({ users }) => (<Component users={users} />);
			
			export default Home;
	    `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};
		
			export async function getStaticProps() {
				const users = await promise;
				return { props: { users } };
			}
			
			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				return { users } ;
			}

			const Home = async ({ params: pageParams, searchParams: pageSearchParams }: PageProps) => {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const { users } = await getData(legacyCtx);
				return (<Component users={users} />)
			};
			
			export default Home;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should inject data fetching function when Page component has implicit return 2', () => {
		let INPUT = `
			export async function getStaticProps() {
				const users = await promise;
				return { props: { users } };
			}

			const Home = ({ users }) => (<><Component users={users} /></>);
			
			export default Home;
	    `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};
	
			type PageProps = {
					params: Params
			};

			export async function getStaticProps() {
				const users = await promise;
				return { props: { users } };
			}
			
			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				return { users } ;
			}
			
			const Home = async ({ params: pageParams, searchParams: pageSearchParams }: PageProps) => {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const { users } = await getData(legacyCtx);
				return (<><Component users={users} /></>)
			};
			
			export default Home;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should inject data fetching function when Page component is functionexpression', () => {
		let INPUT = `
			export async function getStaticProps() {
				const users = await promise;
				return { props: { users } };
			}

			const AppPage: AppPageType['default'] = function AppPage(props) {
				return null;
			};
			
			export default AppPage;
	    `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};
	
			type PageProps = {
					params: Params
			};

			export async function getStaticProps() {
				const users = await promise;
				return { props: { users } };
			}
			
			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				return { users } ;
			}

			const AppPage: AppPageType['default'] = async function AppPage({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const props = await getData(legacyCtx);
				return null;
			};
			
			export default AppPage;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add data hooks on the top level of the component ', () => {
		let INPUT = `
			export async function getStaticProps() {
				const users = await promise;
				const groups = await anotherPromise;

				return { props: { users, groups }, revalidate: 1 };
			}

			export default async function Component({ users, groups }) {
				return <C prop={(a) => {
					return a;
				}}
	      />
			}
	      `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};
	
			type PageProps = {
				params: Params
			};

			export async function getStaticProps() {
				const users = await promise;
				const groups = await anotherPromise;

				return { props: { users, groups }, revalidate: 1 };
			}

			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				const groups = await anotherPromise;
				return { users, groups } ;
			}

			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const { users, groups } = await getData(legacyCtx);

				return <C prop={(a) => {
					return a;
				}} />
			}

			export const revalidate = 1;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT?.replace(/\W/gm, ''),
		);
	});

	it('should add generated code after import statements', () => {
		let INPUT = `
			import x from "y";
			export async function getStaticProps() {
				const users = await promise;
				const groups = await anotherPromise;

				return { props: { users, groups }, revalidate: 1 };
			}

			export default function Component({ users, groups }) {
				return <C prop={(a) => {
					return a;
				}}
	      />
			}
	      `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			import x from "y";
			
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
				params: Params
			};
		
			export async function getStaticProps() {
				const users = await promise;
				const groups = await anotherPromise;

				return { props: { users, groups }, revalidate: 1 };
			}
			
			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				const groups = await anotherPromise;
				return { users, groups } ;
			}
			
			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const { users, groups } = await getData(legacyCtx);

				return <C prop={(a) => {
					return a;
				}} />
			}

			export const revalidate = 1;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT?.replace(/\W/gm, ''),
		);
	});

	it('should work with arrow functions', () => {
		let INPUT = `
			import x from "y";
			export const getStaticProps = async () => {
				const users = await promise;
				const groups = await anotherPromise;

				return { props: { users, groups }, revalidate: 1 };
			}

			export default function Component({ users, groups }) {
				return <C prop={(a) => {
					return a;
				}}
	      />
			}
	      `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			import x from "y";
			
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};

			export const getStaticProps = async () => {
				const users = await promise;
				const groups = await anotherPromise;

				return { props: { users, groups }, revalidate: 1 };
			}

			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				const groups = await anotherPromise;
				return { users, groups } ;
			}
			
			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const { users, groups } = await getData(legacyCtx);

				return <C prop={(a) => {
					return a;
				}} />
			}

			export const revalidate = 1;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT?.replace(/\W/gm, ''),
		);
	});

	it('should work with hooks that have multiple return statements', () => {
		let INPUT = `
			import x from "y";
			export const getStaticProps =  async () => {
				const users = await promise;
				const groups = await anotherPromise;

				if(false) {
					return { props: { users, groups }}
				}

				return { props: { users, groups }, revalidate: 1 };
			}

			export default function Component({ users, groups }) {
				return <C prop={(a) => {
					return a;
				}}
	      />
			}
	      `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			import x from "y";
			
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
				params: Params
			};

			export const getStaticProps =  async () => {
				const users = await promise;
				const groups = await anotherPromise;

				if(false) {
					return { props: { users, groups }}
				}

				return { props: { users, groups }, revalidate: 1 };
			}
			
			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				const groups = await anotherPromise;
				
				if(false) {
					return  { users, groups }
				}
				
				return { users, groups } ;
			}

			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const { users, groups } = await getData(legacyCtx);

				return <C prop={(a) => {
					return a;
				}} />
			}

			export const revalidate = 1;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT?.replace(/\W/gm, ''),
		);
	});

	it('should not duplicate revalidate prop', () => {
		let INPUT = `
			import x from "y";
			
			export const getStaticProps = async () => {
				const users = await promise;
				const groups = await anotherPromise;

				if(false) {
					return { props: { users, groups }, revalidate: 1 }
				}

				return { props: { users, groups }, revalidate: 1 };
			}

			export default async function Component({ users, groups }) {
				return <C prop={(a) => {
					return a;
				}}
	      />
			}
	      `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			import x from "y";
			
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};
		
			export const getStaticProps = async () => {
				const users = await promise;
				const groups = await anotherPromise;

				if(false) {
					return { props: { users, groups }, revalidate: 1}
				}

				return { props: { users, groups }, revalidate: 1 };
			}
			
			async function getData(props: GetStaticPropsContext) {
				const users = await promise;
				const groups = await anotherPromise;
				
				if(false) {
					return  { users, groups }
				}
				
				return { users, groups } ;
			}

			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const { users, groups } = await getData(legacyCtx);

				return <C prop={(a) => {
					return a;
				}} />
			}

			export const revalidate = 1;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT?.replace(/\W/gm, ''),
		);
	});

	it('should add dynamic="force-static" if a page implements getStaticProps', () => {
		let INPUT = `
			
		export const getStaticProps = async () => {
			return { props: {}, revalidate: 1 }
		}

			export default async function Component() {
				return null;
			}
	      `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};
		
			export const getStaticProps = async () => {
				return { props: {}, revalidate: 1 }
			}
			
			async function getData(props: GetStaticPropsContext) {
				return {};
			}	
			
			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				await getData(legacyCtx);

				return null;
			}

			export const revalidate = 1;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT?.replace(/\W/gm, ''),
		);
	});

	it('should replace getServerSideProps', () => {
		let INPUT = `
			export async function getServerSideProps() {
				const res = await fetch(\`https://...\`);
				const projects = await res.json();

				return { props: { projects } };
			}

			export default function Dashboard({ projects }) {
				return (
					<ul>
						{projects.map((project) => (
							<li key={project.id}>{project.name}</li>
						))}
					</ul>
				);
			}
		`;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetServerSidePropsContext } from "next";
			type Params = {
				[key: string]: string | string[] | undefined
			};
	
			type PageProps = {
				params: Params
			};
		
			export async function getServerSideProps() {
				const res = await fetch(\`https://...\`);
				const projects = await res.json();

				return { props: { projects } };
			}

			async function getData(props: GetServerSidePropsContext) {
				const res = await fetch(\`https://...\`);
				const projects = await res.json();
				
				return { projects } ;
			}

			export default async function Dashboard({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const {projects} = await getData(legacyCtx);
				return (
					<ul>
						{projects.map((project) => (
							<li key={project.id}>{project.name}</li>
						))}
					</ul>
				);
			}
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should handle getStaticPaths', () => {
		let INPUT = `
			import PostLayout from '@/components/post-layout';

			export async function getStaticPaths() {
				return {
					paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
					fallback: true,
				};
			}

			export async function getStaticProps({ params }) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();

				return { props: { post } };
			}

			export default function Post({ post }) {
				return <PostLayout post={post} />;
			}
		`;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			import PostLayout from '@/components/post-layout';
		
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};
		
			export async function getStaticPaths() {
				return {
						paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
									fallback: true,
				};
			}

			export async function generateStaticParams() {
				return (await getStaticPaths({})).paths;
			}

			export async function getStaticProps({ params }) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();

				return { props: { post } };
			}

			async function getData({ params }: GetStaticPropsContext) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();
				
				return { post } ;
			}

			export default async function Post({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const {post} = await getData(legacyCtx);

				return <PostLayout post={post} />;
			}

			export const dynamicParams = true;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should transform fallback property correctly 2', () => {
		let INPUT = `
			import PostLayout from '@/components/post-layout';

			export async function getStaticPaths() {
				return {
					paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
					fallback: false,
				};
			}

			export async function getStaticProps({ params }) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();

				return { props: { post } };
			}

			export default function Post({ post }) {
				return <PostLayout post={post} />;
			}
		`;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			import PostLayout from '@/components/post-layout';
		
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};
			
			export async function getStaticPaths() {
				return {
						paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
									fallback: false,
				};
			}

			export async function generateStaticParams() {
				return (await getStaticPaths({})).paths;
			}

			export async function getStaticProps({ params }) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();

				return { props: { post } };
			}

			async function getData({ params }: GetStaticPropsContext) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();
				
				return { post } ;
			}

			export default async function Post({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const {post} = await getData(legacyCtx);

				return <PostLayout post={post} />;
			}

			export const dynamicParams = false;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should transform fallback property correctly', () => {
		let INPUT = `
			import PostLayout from '@/components/post-layout';

			export async function getStaticPaths() {
				return {
					paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
					fallback: 'blocking',
				};
			}

			export async function getStaticProps({ params }) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();

				return { props: { post } };
			}

			export default function Post({ post }) {
				return <PostLayout post={post} />;
			}
		`;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			import PostLayout from '@/components/post-layout';
		
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};

			export async function getStaticPaths() {
				return {
						paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
									fallback: 'blocking',
				};
			}

			export async function generateStaticParams() {
				return (await getStaticPaths({})).paths;
			}

			export async function getStaticProps({ params }) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();

				return { props: { post } };
			}

			async function getData({ params }: GetStaticPropsContext) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();
				
				return { post } ;
			}

			export default async function Post({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const {post} = await getData(legacyCtx);

				return <PostLayout post={post} />;
			}

			export const dynamicParams = true;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should move the default export to the bottom of the file', () => {
		let INPUT = `
			import PostLayout from '@/components/post-layout';

			export default function Post({ post }) {
				return <PostLayout post={post} />;
			}

			export async function getStaticPaths() {
				return {
					paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
					fallback: 'blocking',
				};
			}

			export async function getStaticProps({ params }) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();

				return { props: { post } };
			}
		`;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
			import PostLayout from '@/components/post-layout';
		
			type Params = {
				[key: string]: string | string[] | undefined
			};

			type PageProps = {
					params: Params
			};

			export async function getStaticPaths() {
				return {
						paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
									fallback: 'blocking',
				};
			}

			export async function generateStaticParams() {
				return (await getStaticPaths({})).paths;
			}

			export async function getStaticProps({ params }) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();

				return { props: { post } };
			}

			async function getData({ params }: GetStaticPropsContext) {
				const res = await fetch(\`https://.../posts/\${params.id}\`);
				const post = await res.json();
				
				return { post } ;
			}

			export default async function Post({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const {post} = await getData(legacyCtx);

				return <PostLayout post={post} />;
			}

			export const dynamicParams = true;
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should wrap original getStaticProps when at least one of returnStatement argument is not ObjectExpression', () => {
		let INPUT = `
			export async function getStaticProps() {
				return fetchData();
			}

			export default function Component({ users }) {
				return users.map(user => <b>user</b>)
	          }
	      `;

		let OUTPUT = `
		import { buildLegacyCtx } from "/opt/project/hooks/buildLegacyCtx.tsx";
		import { headers, cookies } from "next/headers";	
		import { GetStaticPropsContext } from "next";
		import { notFound, redirect } from "next/navigation";
		type Params = {
			[key: string]: string | string[] | undefined
		};

		type PageProps = {
				params: Params
		};
		
			export async function getStaticProps() {
				return fetchData();
			}

			const getData = async (ctx: GetStaticPropsContext) => {
				const result = await getStaticProps(ctx);
				
				if("redirect" in result) {
						redirect(result.redirect.destination);
				}
				
				if("notFound" in result) {
						notFound();
				}
				
				return "props" in result ? result.props : {};
		}

			export default async function Component({ params: pageParams, searchParams: pageSearchParams }: PageProps) {
				const legacyCtx = buildLegacyCtx(headers(), cookies(), pageParams, pageSearchParams);
				const {users} = await getData(legacyCtx);

				return users.map(user => <b>user</b>)
			}
			
			export const dynamic = "force-static";
		`;

		let actualOutput = jscodeshiftTransform(
			jscodeshift.withParser('tsx'),
			INPUT,
			globalOptions,
		);
		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
