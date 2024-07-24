import { parse, sep } from "node:path";
import type { Filemod, HandleData, HandleFile } from "@codemod-com/filemod";
import type { JSCodeshift } from "jscodeshift";

// zero dependency ab test middleware factory
const MIDDLEWARE_FACTORY_CONTENT = `
import type { NextMiddleware, NextRequest } from "next/server";
import { NextResponse, URLPattern } from "next/server";

const defaultOnNaN = (testedValue: number, defaultValue: number) =>
  !Number.isNaN(testedValue) ? testedValue : defaultValue;


const cryptoRandom = () => {
  return crypto.getRandomValues(new Uint8Array(1))[0] / 0xff;
};

const getBucket = () => {
  const abTestBucketProbability = defaultOnNaN(
    parseInt(process.env.AB_TEST_BUCKET_PROBABILITY ?? "10", 10),
    10
  );

  return cryptoRandom() * 100 < abTestBucketProbability ? "future" : "legacy";
};

const ROUTES: [URLPattern, boolean][] = [
  ["/page-url-pattern", process.env.APP_ROUTER_PAGE_NAME_ENABLED === "1"] as const,
].map(([pathname, enabled]) => [
  new URLPattern({
    pathname,
  }),
  enabled,
]);

const FUTURE_ROUTES_OVERRIDE_COOKIE_NAME = "x-future-routes-override";
const FUTURE_ROUTES_ENABLED_COOKIE_NAME = "x-future-routes-enabled";

const getBucketCookie = (cookies: NextRequest['cookies']) => {
  const bucketCookie = cookies.get(FUTURE_ROUTES_ENABLED_COOKIE_NAME)?.value;

  if(bucketCookie === undefined) {
    return null;
  }

  if(!['legacy', 'future'].includes(bucketCookie)) {
    return null
  }

  return bucketCookie;
}

export const abTestMiddlewareFactory =
  (next: (req: NextRequest) => Promise<NextResponse<unknown>>): NextMiddleware =>
  async (req: NextRequest) => {
    const response = await next(req);

    const { pathname } = req.nextUrl;

    const override = req.cookies.has(FUTURE_ROUTES_OVERRIDE_COOKIE_NAME);

    const route = ROUTES.find(([regExp]) => regExp.test(req.url)) ?? null;
    const enabled = route !== null ? route[1] || override : false;

    if (pathname.includes("future") || !enabled) {
      return response;
    }

    const safeParsedBucket = override
      ? "future"
      : getBucketCookie(req.cookies);

    if (safeParsedBucket === null) {
      // cookie does not exist or it has incorrect value
      const bucket = getBucket();

      response.cookies.set(FUTURE_ROUTES_ENABLED_COOKIE_NAME, bucket, {
        expires: Date.now() + 1000 * 60 * 30,
        httpOnly: true,
      });

      if (bucket === "legacy") {
        return response;
      }

      const url = req.nextUrl.clone();
      url.pathname = \`future\${pathname}/\`;

      return NextResponse.rewrite(url, response);
    }

    if (safeParsedBucket === "legacy") {
      return response;
    }

    const url = req.nextUrl.clone();
    url.pathname = \`future\${pathname}/\`;

    return NextResponse.rewrite(url, response);
  };
`;

type Dependencies = { jscodeshift: JSCodeshift; j: JSCodeshift };
type State = Record<string, string>;

const handleFile: HandleFile<Dependencies, State> = async (
  _,
  path,
  options,
) => {
  const parsedPath = parse(path);
  if (parsedPath.name === "middleware") {
    return [
      {
        kind: "upsertFile",
        path,
        options,
      },
      {
        kind: "upsertFile",
        path: [parsedPath.dir, "abTestMiddlewareFactory.ts"].join(sep),
        options,
      },
    ];
  }

  return [];
};

const handleData: HandleData<Dependencies, State> = async (api, path, data) => {
  const parsedPath = parse(path);
  if (parsedPath.name === "middleware") {
    const { j } = api.getDependencies();
    const root = j(data);

    root.find(j.ExportDefaultDeclaration).forEach((path) => {
      if (path.node.declaration.type === "Identifier") {
        const identifierName = path.node.declaration.name;

        const importDeclaration = j.importDeclaration(
          [j.importSpecifier(j.identifier("abTestMiddlewareFactory"))],
          j.literal("abTestMiddlewareFactory"),
        );

        root.get().node.program.body.unshift(importDeclaration);

        path.replace(
          j.exportDefaultDeclaration(
            j.callExpression(j.identifier("abTestMiddlewareFactory"), [
              j.identifier(identifierName),
            ]),
          ),
        );
      }
    });

    return {
      kind: "upsertData",
      path,
      data: root.toSource(),
    };
  }

  if (parsedPath.name === "abTestMiddlewareFactory") {
    return {
      kind: "upsertData",
      path,
      data: MIDDLEWARE_FACTORY_CONTENT,
    };
  }

  return { kind: "noop" };
};

export const repomod: Filemod<Dependencies, State> = {
  includePatterns: ["**/*.{js,jsx,ts,tsx}"],
  excludePatterns: ["**/node_modules/**", "**/pages/api/**"],
  handleFile,
  handleData,
};
