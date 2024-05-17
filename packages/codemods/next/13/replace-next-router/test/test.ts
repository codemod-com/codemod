import { deepStrictEqual } from 'node:assert';
import { extname } from 'node:path';
import { Project } from 'ts-morph';
import { describe, it } from 'vitest';
import { handleSourceFile } from '../src/index.js';

let transform = (beforeText: string, afterText: string, path: string) => {
	let project = new Project({
		useInMemoryFileSystem: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			allowJs: true,
		},
	});

	let actualSourceFile = project.createSourceFile(path, beforeText);

	let actual = handleSourceFile(actualSourceFile)?.replace(/\s/gm, '');

	let expected = project
		.createSourceFile(`expected${extname(path)}`, afterText)
		.getFullText()
		.replace(/\s/gm, '');

	return {
		actual,
		expected,
	};
};

describe('next 13 replace-next-router', () => {
	it('should add useSearchParams import because of "router.query"', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const router = useRouter();

				const x = router.query.a;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
				const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
				const x = getParam("a");
			}
	    `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should add useSearchParams import because of "useRouter().query"', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const a = useRouter().query.a;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			function Component() {
				const params = useParams();
	            const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
				const a = getParam("a");
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should add useSearchParams import because of "const { query } = useRouter()"', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const { query } = useRouter();

	              const a = query.a;
			}
		`;

		let afterText = `
	        import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			function Component() {
				const params = useParams();
	            const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
	            const a = getParam('a');
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should add searchParams variable declarator because of "useRouter()"', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const { query } = useRouter();

	            const a = query.a;
			}
		`;

		let afterText = `
	        import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
				const a = getParam('a');
			}
			`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "...?.query" with "Object.fromEntries(...)"', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const r = useRouter();

				const shallowCopiedQuery = { ...r.query }
			}
		`;

		let afterText = `
	          import { useSearchParams } from "next/navigation";

			function Component() {
				const searchParams = useSearchParams();

				const shallowCopiedQuery = { ...Object.fromEntries(searchParams ?? new URLSearchParams()) }
			}
			`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);
		deepStrictEqual(actual, expected);
	});

	it('should replace "?.query" with "searchParams"', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const r = useRouter();

				const a = r.query.a;
			}
		`;

		let afterText = `
	        import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				const a = getParam("a");
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "useRouter().query" with "useSearchParams()"', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const a = useRouter().query.a;
			}
		`;

		let afterText = `
	        import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

	            const a = getParam("a");
			}
			`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace ...router.query with ...Object.fromEntries(searchParams)', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const router = useRouter();

				const x = router.query.a;

				const z = { ...router.query, b: 1 }
			}
		`;

		let afterText = `
	        import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				const x = getParam("a");

				const z = { ...Object.fromEntries(searchParams ?? new URLSearchParams()), b: 1 }
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace router.query.a with getParam("a")', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			const a = 1;

			function Component() {
				const router = useRouter();

				const nextA = useMemo(
					() => (router.query.a ? null : router.query.b),
					[router.query.a, router.query.b, c],
				) ?? a;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			const a = 1;

			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				const nextA = useMemo(
					() => (getParam("a") ? null : getParam("b")),
					[getParam("a"), getParam("b"), c],
				) ?? a;
			}
		`;

		// TODO useMemo second parameter -> searchParams if at all

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "query" with "searchParams"', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
	            const router = useRouter();
				const { a, b, c } = router.query;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			function Component() {
				const params = useParams();
           		const searchParams = useSearchParams();
				const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				const a = getParam("a")
				const b = getParam("b")
				const c = getParam("c")
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should delete query from destructured useRouter call', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const { query } = useRouter();
			}  
		`;

		let afterText = `
			function Component() {
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should delete empty useRouter destructuring', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const { } = useRouter();
			}
		`;

		let afterText = `
			function Component() {

			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should remove unused useRouter import specifiers', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {

			}
		`;

		let afterText = `
			function Component() {

			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should not remove CSS imports', async () => {
		let beforeText = `
			import './index.css';
		`;

		let afterText = `
			import './index.css';
		`;

		let { actual } = transform(beforeText, afterText, 'index.tsx');

		deepStrictEqual(actual, undefined);
	});

	it('should replace { a } = query with a = getParam("a")', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const { query } = useRouter();
				const { a, b, c: d } = query;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				const a = getParam("a")
				const b = getParam("b")
				const d = getParam("c")
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace useRouter().pathname with usePathname()', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const pathname = useRouter().pathname;
			}
	      `;
		let afterText = `
			import { usePathname} from "next/navigation";

			function Component() {
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace router.pathname with usePathname()', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const router = useRouter();
				const pathname = router.pathname;
			}
	      `;

		let afterText = `
			import { usePathname } from "next/navigation";

			function Component() {
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace { pathname } destructed from useRouter() with usePathname()', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const { pathname } = useRouter();
	          }
	      `;

		let afterText = `
			import { usePathname } from "next/navigation";

	        function Component() {
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
	            const pathname = usePathname();
	        }
	    `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it("should insert import after 'use client' directive", async () => {
		let beforeText = `
			  "use client";
	          import { useRouter } from 'next/router';

	          function Component() {
	              const { pathname } = useRouter();
	          }
	      `;

		let afterText = `
			"use client";
			import { usePathname } from "next/navigation";

	        function Component() {
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
	            const pathname = usePathname();
	        }
	    `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace { pathname } destructed from router with usePathname()', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const router = useRouter();

	              const { pathname } = router;
	          }
	      `;

		let afterText = `
			import { usePathname } from "next/navigation";

	        function Component() {
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
	            const pathname = usePathname();
	        }
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace { pathname: p } destructed from router with const p = usePathname()', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const router = useRouter();
	              const { pathname: p } = router;
	          }
	      `;
		let afterText = `
			import { usePathname } from "next/navigation";

			function Component() {
				/** TODO "p" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const p = usePathname();
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace router.isReady with useSearchParams in variable declaration', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const router = useRouter();
	              const ready = router.isReady;
	          }
	      `;
		let afterText = `
			import { useSearchParams } from "next/navigation";

			function Component() {
				const searchParams = useSearchParams();

	            const ready = searchParams !== null;
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace router.isReady with useSearchParams in ternary variable assignment', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const router = useRouter();
				  const ready = router.isReady ? true : false;
	          }
	      `;
		let afterText = `
			import { useSearchParams } from "next/navigation";

			function Component() {
				const searchParams = useSearchParams();
				const ready = searchParams !== null ? true : false;
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace !router.isReady with useSearchParams in variable declaration', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const router = useRouter();
	              const notReady = !router.isReady;
	          }
	      `;
		let afterText = `
			import { useSearchParams } from "next/navigation";

			function Component() {
				const searchParams = useSearchParams();
	            const notReady = searchParams === null;
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace !router.isReady with useSearchParams in ternary variable assignment', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const router = useRouter();
				  const ready = !router.isReady ? false : true;
	          }
	      `;
		let afterText = `
			import { useSearchParams } from "next/navigation";

			function Component() {
				const searchParams = useSearchParams();
				const ready = searchParams === null ? false : true;
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace !router.isReady with useSearchParams in `if` statement', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const router = useRouter();
				  if (!router.isReady) {
					return null;
				  }
	          }
	      `;
		let afterText = `
			import { useSearchParams } from "next/navigation";

			function Component() {
				const searchParams = useSearchParams();
				if (searchParams === null) {
					return null;
				}
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace useRouter().isReady with true', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const ready = useRouter().isReady;
	          }
	      `;
		let afterText = `
			import { useSearchParams } from "next/navigation";

	        function Component() {
				const searchParams = useSearchParams();

				const ready = searchParams !== null;
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should remove { isReady } and replace usages with true', async () => {
		let beforeText = `
	          import { useRouter } from 'next/router';

	          function Component() {
	              const { isReady } = useRouter();
				const ready = isReady;
	          }
	      `;

		let afterText = `
			import { useSearchParams } from "next/navigation";

			function Component() {
				const searchParams = useSearchParams();

				const ready = searchParams !== null;
			}
	      `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should noop for already-existing import', async () => {
		let beforeText = `
			import { usePathname } from 'next/navigation';

			function Component() {
				const pathname = usePathname();
			}
		`;

		let { actual } = transform(beforeText, beforeText, 'index.tsx');

		deepStrictEqual(actual, undefined);
	});

	it('should replace query.a if query comes from useRouter return value destructurizing', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			export function Component() {
				const { query } = useRouter();

				if (query.a && query.b) {

				}
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			export function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				if (getParam('a') && getParam('b')) {

				}
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace { route } = useRouter() with usePathname()', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			export function Component() {
				const { route, pathname } = useRouter();

				return route === 'test' && pathname === 'test';
			}
		`;

		let afterText = `
			import { usePathname } from "next/navigation";

			export function Component() {
				/** TODO "route" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const route = usePathname();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();

				return route === 'test' && pathname === 'test';
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace useRouter().query[A] with useSearchParams', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			const A = 'constant';

			export function Component() {
				const a = useRouter().query[A];
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			const A = 'constant';

			export function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
				const a = getParam(A);
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace useRouter().query as A with useSearchParams', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			export function Component() {
				const { a: b } = useRouter().query as A;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			export function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				const b = getParam("a");
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace router.pathname with pathname', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			export function Component() {
				const router = useRouter();

				return <b>{router.pathname}</b>;
			}
		`;

		let afterText = `
			import { usePathname } from "next/navigation";

			export function Component() {
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();

				return <b>{pathname}</b>;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace router.asPath with usePathname + useSearchParams', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			export function Component() {
				const router = useRouter();

				return <b>{router.asPath}</b>;
			}
		`;

		let afterText = `
			import { usePathname, useSearchParams } from "next/navigation";
			import { useMemo } from "react";

			export function Component() {
				const searchParams = useSearchParams();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();
      			const asPath = useMemo(() => \`\${pathname}\${searchParams ? "?" + searchParams.toString() : ""}\`, [pathname, searchParams]);

				return <b>{asPath}</b>;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should switch the useRouter import source to next/router for router.push', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			export function Component() {
				const router = useRouter();

				useEffect(() => {
					router.push('/);
				})
			}
		`;

		let afterText = `
			import { useRouter } from "next/navigation";

			export function Component() {
				const router = useRouter();

				useEffect(() => {
					router.push('/);
				})
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should transform usages within a JS default function', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			export default function DynamicRoutes() {
				const { query } = useRouter();
				return (
					<div>
						{query.a}
					</div>
				)
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			export default function DynamicRoutes() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				return (
					<div>
						{getParam('a')}
					</div>
				)
			}
		`;

		let { actual, expected } = transform(beforeText, afterText, 'index.js');

		deepStrictEqual(actual, expected);
	});

	it('should replace useRouter().query with ...Object.fromEntries(searchParams ?? new URLSearchParams())', () => {
		let beforeText = `
			import React from 'react'
			import { useRouter } from 'next/router'

			export default () => {
				return (
					<>
						<div>{JSON.stringify(useRouter().query)}</div>
					</>
				)
			}
		`;

		let afterText = `
			import { useSearchParams } from "next/navigation";
			import React from 'react'

			export default () => {
				const searchParams = useSearchParams();

				return (
					<>
						<div>{JSON.stringify(...Object.fromEntries(searchParams ?? new URLSearchParams()))}</div>
					</>
				)
			}
		`;

		let { actual, expected } = transform(beforeText, afterText, 'index.js');

		deepStrictEqual(actual, expected);
	});

	it('should replace router.isReady, router.asPath, router.href with proper replacements', () => {
		let beforeText = `
			import { useRouter } from 'next/router'

			function Component() {
				const router = useRouter();

				const [path,] = useState(
					router.isReady ? router.asPath : router.href
				);

				return null;
			}
		`;

		let afterText = `
			import { usePathname, useSearchParams } from "next/navigation";
			import { useMemo } from "react";

			function Component() {
				const searchParams = useSearchParams();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();
				const asPath = useMemo(() => \`\${pathname}\${searchParams ? "?" + searchParams.toString() : ""}\`, [pathname, searchParams]);

				const [path,] = useState(searchParams !== null ? asPath : pathname);

				return null;
			}
		`;

		let { actual, expected } = transform(beforeText, afterText, 'index.js');

		deepStrictEqual(actual, expected);
	});

	it('should replace useRouter().isFallback with false', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			export default function Component(props) {
				if (useRouter().isFallback) {
					return null;
				}

				return <div></div>;
			}
		`;

		let afterText = `
			export default function Component(props) {
				if (false) {
					return null;
				}

				return <div></div>;
			}
		`;

		let { actual, expected } = transform(beforeText, afterText, 'index.js');

		deepStrictEqual(actual, expected);
	});

	it('should replace router.isFallback with false', () => {
		let beforeText = `
			import { useRouter } from 'next/router'

			const Component = () => {
		  		const router = useRouter()

		  		if (router.isFallback) {
		    		return null;
		  		}

				return null;
			}
		`;

		let afterText = `
			const Component = () => {
				if (false) {
					return null;
				}

				return null;
			}
		`;

		let { actual, expected } = transform(beforeText, afterText, 'index.js');

		deepStrictEqual(actual, expected);
	});

	it('should retain the useRouter import when router is in use', () => {
		let beforeText = `
			import { useRouter } from 'next/router'

			const Component = () => {
		  		const router = useRouter()

				React.useEffect(
					() => {

					},
					[router]
				)

				const a = router.pathname.includes('a')

				return null;
			}
		`;

		let afterText = `
			import { usePathname, useRouter } from "next/navigation";

			const Component = () => {
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
	   			const pathname = usePathname();
	   			const router = useRouter()

				React.useEffect(
					() => {
					},
					[router]
				)

	   			const a = pathname?.includes('a')
			return null;
		}

		`;

		let { actual, expected } = transform(beforeText, afterText, 'index.js');

		deepStrictEqual(actual, expected);
	});

	it('should use searchParams when dealing with function(query)', () => {
		let beforeText = `
			import { useRouter } from 'next/router'

			const Component = () => {
		  		const { query } = useRouter()

				return JSON.stringify(query);
			}
		`;

		let afterText = `
			import { useSearchParams } from "next/navigation";

			const Component = () => {
				const searchParams = useSearchParams();
				return JSON.stringify(searchParams);
			}
		`;

		let { actual, expected } = transform(beforeText, afterText, 'index.js');

		deepStrictEqual(actual, expected);
	});

	it('should use searchParams when dealing with function(query)', () => {
		let beforeText = `
			import { useRouter } from 'next/router'

			const Component = () => {
		  		const { locale } = useRouter()

				return null;
			}
		`;

		let afterText = `
			const Component = () => {
				return null;
			}
		`;

		let { actual, expected } = transform(beforeText, afterText, 'index.js');

		deepStrictEqual(actual, expected);
	});

	it('should replace router.asPath.startsWith with pathname?.startsWith', () => {
		let beforeText = `
			import { useRouter } from "next/router";

			export default function Component() {
		  		const router = useRouter();

				useEffect(
					() => {
						router.replace("a");
					},
					[router]
				);

				const a = router.asPath.startsWith("a");

				return null;
			}
		`;

		let afterText = `
			import { usePathname, useRouter, useSearchParams } from "next/navigation";
			import { useMemo } from "react";

			export default function Component() {
				const searchParams = useSearchParams();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
           		const pathname = usePathname();
    			const asPath = useMemo(() => \`\${pathname}\${searchParams ? "?" + searchParams.toString() : ""}\`, [pathname, searchParams]);

				const router = useRouter();

				useEffect(
					() => {
						router.replace("a");
					},
					[router]
				);

				const a = asPath.startsWith("a");

				return null;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "{ asPath } = useRouter()" with "pathname = usePathname()"', () => {
		let beforeText = `
			import { useRouter } from "next/router";

			export default function Component() {
				const { asPath } = useRouter();

				const a = asPath.startsWith("a");

				return null;
			}
		`;

		let afterText = `
			import { usePathname, useSearchParams } from "next/navigation";
			import { useMemo } from "react";

			export default function Component() {
				const searchParams = useSearchParams();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();
				const asPath = useMemo(() => \`\${pathname}\${searchParams ? "?" + searchParams.toString() : ""}\`, [pathname, searchParams]);
				
				const a = asPath.startsWith("a");

				return null;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "path = useRouter().asPath" with "path = usePathname()"', () => {
		let beforeText = `
			import { useRouter } from "next/router";

			export default function Component() {
				const path = useRouter().asPath;

				const a = path.startsWith("a");

				return null;
			}
		`;

		let afterText = `
			import { usePathname, useSearchParams } from "next/navigation";
			import { useMemo } from "react";

			export default function Component() {
				const searchParams = useSearchParams();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();
				const asPath = useMemo(() => \`\${pathname}\${searchParams ? "?" + searchParams.toString() : ""}\`, [pathname, searchParams]);
				const a = asPath.startsWith("a");

				return null;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "router.query[name]" with "getParam(name)"', () => {
		let beforeText = `
			import { useRouter } from "next/router";

			export default function Component() {
				const router = useRouter();

				const param = router.query["param"];

				return null;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			export default function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				const param = getParam("param");

				return null;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "router.replace({pathname: string})" with "router.replace(href: string)"', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const router = useRouter();
				router.replace({
					pathname: "/auth/login",
				});
			}
	  	`;

		let afterText = `
	  		import { useRouter } from "next/navigation";

			function Component() {
				const router = useRouter();
				router.replace("/auth/login");
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "router.replace({pathname: string, query: {...})" with "router.replace(href: string)"', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const router = useRouter();
				router.replace({
					pathname: "/auth/login",
					query: {
					  callbackUrl: \`/apps/\${slug}/setup\`,
					},
				});
			}
	  	`;

		let afterText = `
	  		import { useRouter } from "next/navigation";

			function Component() {
				const urlSearchParams = new URLSearchParams();
				urlSearchParams.set('callbackUrl', \`/apps/\${slug}/setup\`);
				const router = useRouter();
				router.replace(\`/auth/login?\${urlSearchParams.toString()}\`);
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "router.push({pathname: string})" with "router.push(href: string)"', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const router = useRouter();
				router.push({
					pathname: "/auth/login",
				});
			}
	  	`;

		let afterText = `
	  		import { useRouter } from "next/navigation";

			function Component() {
				const router = useRouter();
				router.push("/auth/login");
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace useRouter import when push is destructured', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const { push } = useRouter();
				push("/auth/login");
			}
	  	`;

		let afterText = `
	  		import { useRouter } from "next/navigation";

			function Component() {
				const { push } = useRouter();
				push("/auth/login");
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace useRouter import when push is destructured  2', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const { push } = useRouter();
				push({
					pathname: '/auth/login',
					query: {
					  callbackUrl: \`/apps/\${slug}/setup\`,
						param: var1, 
						param1: fn(),
					},
				});
			}
	  	`;

		let afterText = `
	  		import { useRouter } from "next/navigation";

			function Component() {
				const urlSearchParams = new URLSearchParams();
				urlSearchParams.set('callbackUrl', \`/apps/\${slug}/setup\`);
				urlSearchParams.set('param', var1);
				urlSearchParams.set('param1', fn());
				const { push } = useRouter();
				push(\`/auth/login?\${urlSearchParams.toString()}\`);
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace "router.push({pathname: string, query: {...})" with "router.push(href: string)"', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const router = useRouter();
				router.push({
					pathname: '/auth/login',
					query: {
					  callbackUrl: \`/apps/\${slug}/setup\`,
						param: var1, 
						param1: fn(),
					},
				});
			}
	  	`;

		let afterText = `
	  		import { useRouter } from "next/navigation";

			function Component() {
				const urlSearchParams = new URLSearchParams();
				urlSearchParams.set('callbackUrl', \`/apps/\${slug}/setup\`);
				urlSearchParams.set('param', var1);
				urlSearchParams.set('param1', fn());
				const router = useRouter();
				router.push(\`/auth/login?\${urlSearchParams.toString()}\`);
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should handle "const { query: { rescheduleUid } = {} } = useRouter();"', () => {
		let beforeText = `
			import { useRouter } from "next/router";

			export default function Component() {
				const { query: { param1, param2 } = {} } = useRouter();

				return null;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";

			export default function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
			  	const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);

				const param1 = getParam("param1")
				const param2 = getParam("param2")

				return null;}
				`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should remove await from "await router.push(href: string)"', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const router = useRouter();
				const handleRouting = async () => {
					await router.push('/auth/login');
				};
			}
	  	`;

		let afterText = `
	  		import { useRouter } from "next/navigation";
		
			function Component() {
				const router = useRouter();
				const handleRouting = async () => {
					router.push('/auth/login');
				};
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should remove await from "await router.replace(href: string)"', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const router = useRouter();
				const handleRouting = async () => {
					await router.replace('/auth/login');
				};
			}
	  	`;

		let afterText = `
	  		import { useRouter } from "next/navigation";
		
			function Component() {
				const router = useRouter();
				const handleRouting = async () => {
					router.replace('/auth/login');
				};
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace NextRouter with AppRouterInstance', () => {
		let beforeText = `
			import type { NextRouter } from "next/router"; 
			function Component(router: NextRouter) {}
		`;

		let afterText = `
			import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
			function Component(router: AppRouterInstance) {}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should support rest operator "{ p1, p2, ...r } = r.query"', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component() {
				const r = useRouter();
				const { p1: param1, p2, ...r } = r.query;
				
			}
		`;

		let afterText = `
	    import { useSearchParams } from "next/navigation";

			function Component() {
				const searchParams = useSearchParams();

				const { p1: param1, p2, ...r} = Object.fromEntries(searchParams?.entries() ?? []);
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should support call expression parent node', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function() {
				const router = useRouter();
				const { id: orgId } = querySchema.parse(router.query);
			}
		`;

		let afterText = `
			import { useSearchParams } from "next/navigation";

			function() {
				const searchParams = useSearchParams();
				const { id: orgId } = querySchema.parse(...Object.fromEntries(searchParams ?? new URLSearchParams()));
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should ensure that `useRouter` import is updated', () => {
		let beforeText = `
		import { useRouter } from "next/router";
		
		function Test() {
		  const router = useRouter();
		  const x = router;
		}
	`;

		let afterText = `
		import { useRouter } from "next/navigation";
		
		function Test() {
		  const router = useRouter();
		  const x = router;
		}
	`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should ensure that `useRouter` import is added when `router` is used as a short-hand property', () => {
		let beforeText = `
		import { useRouter } from "next/router";
		
		export default function CustomThemeProvider() {
		  const router = useRouter();

		  return (
			<ThemeProvider {...getThemeProviderProps({ props, router })} />
		  );
		}
	`;

		let afterText = `
		import { useRouter } from "next/navigation";
		
		export default function CustomThemeProvider() {
		  const router = useRouter();
		
		  return (
			<ThemeProvider {...getThemeProviderProps({ props, router })} />
		  );
		}
	`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it("should transform usages of the query property of the router's binding element", () => {
		let beforeText = `
		import { useState, useEffect } from 'react';
		import { useRouter } from 'next/router';

		export default function useX(): void {
			const router = useRouter();
			const { query } = router;

			useEffect(
				() => {
					if (!router.isReady) {
						return;
					}

					if (query.a === 'a') {
						return;
					}

					if (typeof query.a === 'undefined') {
						return;
					}
				},
				[query, router]
			);
		}
		`;

		let afterText = `
		import { useParams, useRouter, useSearchParams } from "next/navigation";
		import { useState, useEffect, useCallback } from 'react';

		export default function useX(): void {
			const params = useParams();
			const searchParams = useSearchParams();
			const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
			
			const router = useRouter();
			
			useEffect(() => {
				if (searchParams === null) {
					return;
				}
				if (getParam("a") === 'a') {
					return;
				}
				if (typeof getParam("a") === 'undefined') {
					return;
				}
			}, [searchParams, router]);
		}`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it("should transform the element-access-expression usages of the query property of the router's binding element", () => {
		let beforeText = `
		import { useRouter } from 'next/router';

		function Component(): JSX.Element {
			const { query } = useRouter();
		  
			const obj = useMemo(
				() => objects?.find((f) => f.a === query.a),
				[query.a],
			);
		  
			const result =
				typeof query['a-b-c'] === 'string'
				? {
					a: query['a-b-c'],
				}
				: obj;
		`;

		let afterText = `
		import { useParams, useSearchParams } from "next/navigation";
		import { useCallback } from "react";
		
		function Component(): JSX.Element {
			const params = useParams();
			const searchParams = useSearchParams();
			const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
			const obj = useMemo(() => objects?.find((f) => f.a === getParam('a')), [getParam('a')],);
			
			const result = typeof getParam('a-b-c') === 'string'
				? {
					a: getParam('a-b-c'),
				}
				: obj;
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should change the useRouter import from next/router into next/navigation', () => {
		let beforeText = `
			import { useRouter } from 'next/router';

			function Component(): JSX.Element {
				const router = useRouter();
			
				return x(router);
			}
		`;

		let afterText = `
			import { useRouter } from "next/navigation";

			function Component(): JSX.Element {
				const router = useRouter();
			
				return x(router);
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should use different names for params and searchParams if the defaults are already used', () => {
		let beforeText = `
			import { useRouter } from "next/router";

			function Component(): JSX.Element {
				const { query, asPath } = useRouter();
				const searchParams = 1;
				const params = 2;

				log(asPath);

				return query.a;
			}
		`;

		let afterText = `
			import { useParams, usePathname, useSearchParams } from "next/navigation";
			import { useCallback, useMemo } from "react";

			function Component(): JSX.Element {
				const __params__ = useParams();
				const __searchParams__ = useSearchParams();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();

				const getParam = useCallback((p: string) => __params__?.[p] ?? __searchParams__?.get(p), [__params__, __searchParams__]);
				const asPath = useMemo(() => \`\${pathname}\${__searchParams__ ? "?" + __searchParams__.toString() : ""}\`, [pathname, __searchParams__]);
				const searchParams = 1;
				const params = 2;

				log(asPath);

				return getParam('a');
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should not add React hook imports to type-only imports', () => {
		let beforeText = `
			import type { ReactNode } from 'react';
			import { useRouter } from "next/router";

			function Component(): JSX.Element {
				const { asPath } = useRouter();

				return asPath;
			}
		`;

		let afterText = `
			import { usePathname, useSearchParams } from "next/navigation";
			import type { ReactNode } from 'react';
			import { useMemo } from "react";

			function Component(): JSX.Element {
				const searchParams = useSearchParams();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();
				const asPath = useMemo(() => \`\${pathname}\${searchParams ? "?" + searchParams.toString() : ""}\`, [pathname, searchParams]);
				return asPath;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should convert router.push within arrow functions', () => {
		let beforeText = `
			import { useRouter } from "next/router";
			import { useEffect } from "react";

			function Component(): JSX.Element {
				const router = useRouter();

				return <A
					onClick={() => router.push({
						pathname: '/users/',
						query: { a: 1 }
					})}
				/>;
			}
		`;

		let afterText = `
			import { useRouter } from "next/navigation";
			import { useEffect } from "react";
			function Component(): JSX.Element {
				const router = useRouter();
				return <A onClick={() => {
					const urlSearchParams = new URLSearchParams();
					urlSearchParams.set('a', 1);
					return router.push(\`/users/?\${urlSearchParams.toString()}\`)
				}}/>;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should transform Object.entries(router.query) properly', () => {
		let beforeText = `
			import { useRouter } from "next/router";

			function Component() {
				const router = useRouter();

				Object.entries(router.query).forEach(([key, value]) => {
					console.log(key, value)
				});
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useMemo } from "react";

			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();

				const paramMap = useMemo(() => {
					const paramMap = new Map<string, string>(searchParams);
					Object.entries(params).forEach(([key, value]) => {
						if (typeof value === 'string') {
							paramMap.set(key, value);
							return;
						}
						if (value[0] !== undefined) {
							paramMap.set(key, value[0]);
						}
					});
					return paramMap;
				}, [params, searchParams]);

				Array.from(paramMap).forEach(([key, value]) => {
					console.log(key, value)
				});
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should handle correctly the "router.query as C" destructuring', () => {
		let beforeText = `
			import { useRouter } from "next/router";

			function Component() {
				const router = useRouter();

				const { a = query.a, b = query.b } =
  				router.query as C;
			}
		`;

		let afterText = `
				import { useParams, useSearchParams } from "next/navigation";
				import { useCallback } from "react";
		
				function Component() {
					const params = useParams();
					const searchParams = useSearchParams();
					const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
					
					const a = getParam("a")
					const b = getParam("b")
				}
		
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should not duplicate existing useCallback and useMemo named imports', () => {
		let beforeText = `
			import { useCallback, useMemo } from "react";
			import { useRouter } from "next/router";

			function Component() {
				const router = useRouter();

				const { a } = router.query;
				const b = router.asPath;

				return a + b;
			}
		`;

		let afterText = `
			import { useParams, usePathname, useSearchParams } from "next/navigation";
			import { useCallback, useMemo } from "react";

			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();
				const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
				const asPath = useMemo(() => \`\${pathname}\${searchParams ? "?" + searchParams.toString() : ""}\`, [pathname, searchParams]);
				const a = getParam("a")
				const b = asPath;

				return a + b;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace asPath from destructuring a router', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';
			function Component() {
				const router = useRouter();
				const { asPath } = router;
				return asPath;
			}
		`;

		let afterText = `
			import { usePathname, useSearchParams } from "next/navigation";
			import { useMemo } from "react";
			
			function Component() {
				const searchParams = useSearchParams();
				/** TODO "pathname" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const pathname = usePathname();
				const asPath = useMemo(() => \`\${pathname}\${searchParams ? "?" + searchParams.toString() : ""}\`, [pathname, searchParams]);
				return asPath;
			}
	    `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace asPath from destructuring a router with different name and property nodes', async () => {
		let beforeText = `
			import { useRouter } from 'next/router';
			function Component() {
				const pathname = 1;
				const router = useRouter();
				const { asPath: a } = router;
				return a;
			}
		`;

		let afterText = `
			import { usePathname, useSearchParams } from "next/navigation";
			import { useMemo } from "react";
			
			function Component() {
				const searchParams = useSearchParams();
				/** TODO "__pathname__" no longer contains square-bracket expressions. Rewrite the code relying on them if required. **/
				const __pathname__ = usePathname();
				const a = useMemo(() => \`\${__pathname__}\${searchParams ? "?" + searchParams.toString() : ""}\`, [__pathname__, searchParams]);
				const pathname = 1;
				return a;
			}
	    `;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should extract the property name instead of a name when destructuring router.query', () => {
		let beforeText = `
			import { useRouter } from "next/router";
			function Component() {
				const router = useRouter();
				const { 'a-b': ab } = router.query;
				return ab;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";
			
			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
				const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
				const ab = getParam("a-b")
				return ab;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace destructuring of useRouter().query properly', () => {
		let beforeText = `
			import { useRouter } from "next/router";
			
			function Component() {
				const { a, b, c: d } = useRouter().query;
				return a;
			}
		`;

		let afterText = `
			import { useParams, useSearchParams } from "next/navigation";
			import { useCallback } from "react";
			
			function Component() {
				const params = useParams();
				const searchParams = useSearchParams();
				const getParam = useCallback((p: string) => params?.[p] ?? searchParams?.get(p), [params, searchParams]);
				const a = getParam("a")
				const b = getParam("b")
				const d = getParam("c")
				return a;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should replace next/router jest mock with next/navigation', () => {
		let beforeText = `
			jest.mock('next/router', () => ({
				useRouter: jest.fn(() => router),
			}));
		`;

		let afterText = `
			jest.mock('next/navigation', () => ({
				useRouter: jest.fn(() => router),
			}));
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'index.tsx',
		);

		deepStrictEqual(actual, expected);
	});

	it('should simplify getParam(x) if the file path contains dynamic segments', () => {
		let beforeText = `
			import { useRouter } from "next/router";
				
			function Component() {
				const { a, b, c: d } = useRouter().query;
				return a;
			}
		`;

		let afterText = `
			import { useParams } from "next/navigation";

			function Component() {
				const params = useParams();
				const a = params["a"];
				const b = params["b"];
				const d = params["c"];
			
				return a;
			}
		`;

		let { actual, expected } = transform(
			beforeText,
			afterText,
			'/pages/[[...a]]/[b]/[c].tsx',
		);

		deepStrictEqual(actual, expected);
	});
});
