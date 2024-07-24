import { deepStrictEqual } from "node:assert";
import type { UnifiedFileSystem } from "@codemod-com/filemod";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import tsmorph from "ts-morph";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const transform = async (json: DirectoryJSON) => {
  const volume = Volume.fromJSON(json);

  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/");

  const api = buildApi<{
    tsmorph: typeof tsmorph;
    unifiedFileSystem: UnifiedFileSystem;
  }>(
    unifiedFileSystem,
    () => ({
      tsmorph,
      unifiedFileSystem,
    }),
    pathApi,
  );

  return executeFilemod(api, repomod, "/", {}, {});
};

describe("next 13 replace-API-routes", () => {
  it("should transform API router handler: functionDeclaration", async () => {
    const A_CONTENT = `
		export default function handler() {
			if(req.method === 'GET') {
				// GET block
			}
		}
	`;

    const [upsertFileCommand] = await transform({
      "/opt/project/pages/api/hello.ts": A_CONTENT,
    });

    const expectedResult = `
		import { type NextRequest, NextResponse } from 'next/server';
		
		export async function GET() {
				// GET block
		}
		`;

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(
      upsertFileCommand.path,
      "/opt/project/app/api/hello/route.ts",
    );

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should transform API router handler: arrow function", async () => {
    const A_CONTENT = `
			const handler = () => {
				if(req.method === 'GET') {
					// GET block
				}
			}
			
			export default handler;
	`;

    const [upsertFileCommand] = await transform({
      "/opt/project/pages/api/hello.ts": A_CONTENT,
    });

    const expectedResult = `
		import { type NextRequest, NextResponse } from 'next/server';
		
		export async function GET() {
				// GET block
		}
		`;

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(
      upsertFileCommand.path,
      "/opt/project/app/api/hello/route.ts",
    );

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should split single handler to method handlers: should support all HTTP methods ", async () => {
    const A_CONTENT = `
		export default function handler() {
			if(req.method === 'GET') {
				// GET block
			}
			
			if (req.method === 'POST') {
				// POST block
			} 
			
			if(req.method === 'PUT') {
				// PUT block
			}
			
			if(req.method === 'DELETE') {
				// DELETE block
			}
			
			if(req.method === 'PATCH') {
				// PATCH block
			}
		}
	`;

    const [upsertFileCommand] = await transform({
      "/opt/project/pages/api/hello.ts": A_CONTENT,
    });

    const expectedResult = `
		import { type NextRequest, NextResponse } from 'next/server';
		
		export async function PATCH() {
			// PATCH block
		}
		export async function DELETE() {
				// DELETE block
		}
		export async function PUT() {
				// PUT block
		}
		export async function POST() {
				// POST block
		}
		export async function GET() {
				// GET block
		}
		`;

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(
      upsertFileCommand.path,
      "/opt/project/app/api/hello/route.ts",
    );

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  /**
   * const a = 1;
   * const b = 1;
   * if (req.method === 'GET' && a === b) {
   * // GET block
   * }
   *
   * =>
   *
   * export function GET() {
   * const a = 1;
   * const b = 1;
   * if(a === b) {
   * // GET block
   * }
   * }
   */
  it(
    "should split single handler to method handlers: should support nested binary expressions and external refs",
  );

  it("should rewrite response callExpressions: support chained call expressions", async () => {
    const A_CONTENT = `
		export default function handler(req, res) {
			if(req.method === 'GET') {
				res.status(1).json({ })
			}
		}
	`;

    const [upsertFileCommand] = await transform({
      "/opt/project/pages/api/hello.ts": A_CONTENT,
    });

    const expectedResult = `
		import { type NextRequest, NextResponse } from 'next/server';
		
		export async function GET(req: NextRequest) {
				return NextResponse.json({ }, { "status": "1" })
		}
		`;

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(
      upsertFileCommand.path,
      "/opt/project/app/api/hello/route.ts",
    );

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  /**
	 * export default function handler(req, res) {
			if(req.method === 'GET') {
				res
				.setHeader('a', ['b', 'c'])
				.setHeader('a', ['b1', 'c1']).json({ })
			}
		}
		
		=> 
		import { type NextRequest, NextResponse } from 'next/server';
		
		export async function GET(req: NextRequest) {
				return NextResponse.json({ }, { "headers": { "a": "b1, c1" })
		}
	 */

  it("should rewrite response callExpressions: support setHeader");

  /**
	 * 	export default function handler(req, res) {
			if(req.method === 'GET') {
				res
				.appendHeader('a', ['b', 'c'])
				.appendHeader('a', ['b1', 'c1']).json({ })
			}
		} 
		=>
		
		import { type NextRequest, NextResponse } from 'next/server';
		
		export async function GET(req: NextRequest) {
				return NextResponse.json({ }, { "headers": { "a": "b, c, b1, c1" })
		}
	 */
  it("should rewrite response callExpressions: support appendHeader");

  it("should rewrite response callExpressions: support nested scopes", async () => {
    const A_CONTENT = `
			export default function handler(req, res) {
				if(req.method === 'GET') {
					res.statusCode = 401;
					if(1) {
						if(1) {
							res.statusCode = 202;
							res.json({});
						} else {
							res.json({})
						}
					} else {
						res.statusCode = 304;
						
						if(1) {
							res.json({})
						}
					}
				}
			}
		`;

    const [upsertFileCommand] = await transform({
      "/opt/project/pages/api/hello.ts": A_CONTENT,
    });

    const expectedResult = `
			import { type NextRequest, NextResponse } from 'next/server';
			export async function GET(req: NextRequest) {
					if (1) {
							if (1) {
									return NextResponse.json({}, { "status": "202" });
							}
							else {
									return NextResponse.json({}, { "status": "401" });
							}
					}
					else {
							if (1) {
									return NextResponse.json({}, { "status": "304" });
							}
					}
			}
			`;

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(
      upsertFileCommand.path,
      "/opt/project/app/api/hello/route.ts",
    );

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should rewrite response callExpressions: support json, send, end methods", async () => {
    const A_CONTENT = `
			export default function handler(req, res) {
				if(req.method === 'GET') {
					if(1) {
						res.json({})
					}
					
					if(2) {
						res.send(1)
					}
					
					if(3) {
						res.end()
					}
				}
			}
		`;

    const [upsertFileCommand] = await transform({
      "/opt/project/pages/api/hello.ts": A_CONTENT,
    });

    const expectedResult = `
			import { type NextRequest, NextResponse } from 'next/server';
			export async function GET(req: NextRequest) {
				if(1) {
					return NextResponse.json({});
				}
				
				if(2) {
					return new NextResponse(1);
				}
				
				if(3) {
					return new NextResponse(undefined);
				}
			}
			`;

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(
      upsertFileCommand.path,
      "/opt/project/app/api/hello/route.ts",
    );

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });
});
