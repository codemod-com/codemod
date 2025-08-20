import { NextRequest, NextResponse } from "next/server";

const TAGS = {
  Tag: [
    {
      id: 1,
      title: "next.js",
      aliases: "{next.js,nextjs,next}",
      classification: "framework",
      displayName: "Next.js",
      createdAt: "2024-03-26T21:46:56.634Z",
      updatedAt: "2024-03-26T21:46:56.634Z",
    },
    {
      id: 2,
      title: "react",
      aliases: "{react.js,reactjs,react}",
      classification: "framework",
      displayName: "React",
      createdAt: "2024-03-26T21:47:19.704Z",
      updatedAt: "2024-03-26T21:47:19.704Z",
    },
    {
      id: 3,
      title: "migration",
      aliases: "{migration}",
      classification: "useCaseCategory",
      displayName: "Migration",
      createdAt: "2024-04-09T21:21:53.268Z",
      updatedAt: "2024-04-09T21:21:53.268Z",
    },
    {
      id: 4,
      title: "best_practices",
      aliases: '{"best practices"}',
      classification: "useCaseCategory",
      displayName: "Best practices",
      createdAt: "2024-04-09T21:21:53.268Z",
      updatedAt: "2024-04-09T21:21:53.268Z",
    },
    {
      id: 5,
      title: "refactoring",
      aliases: "{refactoring}",
      classification: "useCaseCategory",
      displayName: "Refactoring",
      createdAt: "2024-04-09T21:21:53.268Z",
      updatedAt: "2024-04-09T21:21:53.268Z",
    },
    {
      id: 6,
      title: "cleanup",
      aliases: "{cleanup}",
      classification: "useCaseCategory",
      displayName: "Cleanup",
      createdAt: "2024-04-09T21:21:53.268Z",
      updatedAt: "2024-04-09T21:21:53.268Z",
    },
    {
      id: 7,
      title: "mining",
      aliases: "{mining}",
      classification: "useCaseCategory",
      displayName: "Mining",
      createdAt: "2024-04-09T21:21:53.268Z",
      updatedAt: "2024-04-09T21:21:53.268Z",
    },
    {
      id: 8,
      title: "security",
      aliases: "{security}",
      classification: "useCaseCategory",
      displayName: "Security",
      createdAt: "2024-04-09T21:21:53.268Z",
      updatedAt: "2024-04-09T21:21:53.268Z",
    },
    {
      id: 9,
      title: "other",
      aliases: "{other}",
      classification: "useCaseCategory",
      displayName: "Other",
      createdAt: "2024-04-09T21:21:53.268Z",
      updatedAt: "2024-04-09T21:21:53.268Z",
    },
    {
      id: 10,
      title: "typescript",
      aliases: "{typescript}",
      classification: "framework",
      displayName: "Typescript",
      createdAt: "2024-04-10T20:27:28.039Z",
      updatedAt: "2024-04-10T20:27:28.039Z",
    },
    {
      id: 12,
      title: "react-router",
      aliases: '{react-router,reactrouter,"react router"}',
      classification: "framework",
      displayName: "React Router",
      createdAt: "2024-04-10T20:33:31.892Z",
      updatedAt: "2024-04-10T20:33:31.892Z",
    },
    {
      id: 13,
      title: "react-redux",
      aliases: '{react-redux,reactredux,"react redux"}',
      classification: "framework",
      displayName: "React Redux",
      createdAt: "2024-04-10T20:34:35.769Z",
      updatedAt: "2024-04-10T20:34:35.769Z",
    },
    {
      id: 14,
      title: "next-i18next",
      aliases: "{next-i18next}",
      classification: "framework",
      displayName: "next-i18next",
      createdAt: "2024-04-10T20:35:44.258Z",
      updatedAt: "2024-04-10T20:35:44.258Z",
    },
    {
      id: 17,
      title: "msw",
      aliases: '{msw,mswjs,"mock service worker"}',
      classification: "framework",
      displayName: "Mock Service Worker",
      createdAt: "2024-04-10T20:38:41.743Z",
      updatedAt: "2024-04-10T20:38:41.743Z",
    },
    {
      id: 18,
      title: "mocha",
      aliases: "{mocha}",
      classification: "framework",
      displayName: "Mocha",
      createdAt: "2024-04-10T20:39:20.693Z",
      updatedAt: "2024-04-10T20:39:20.693Z",
    },
    {
      id: 19,
      title: "jest",
      aliases: "{jest}",
      classification: "framework",
      displayName: "Jest",
      createdAt: "2024-04-10T20:39:44.240Z",
      updatedAt: "2024-04-10T20:39:44.240Z",
    },
    {
      id: 20,
      title: "intuita",
      aliases: "{intuita}",
      classification: "framework",
      displayName: "Intuita",
      createdAt: "2024-04-10T20:41:14.361Z",
      updatedAt: "2024-04-10T20:41:14.361Z",
    },
    {
      id: 22,
      title: "eslint",
      aliases: "{eslint}",
      classification: "framework",
      displayName: "ESlint",
      createdAt: "2024-04-10T20:42:17.492Z",
      updatedAt: "2024-04-10T20:42:17.492Z",
    },
    {
      id: 23,
      title: "ember",
      aliases: "{ember,emberjs,ember.js}",
      classification: "framework",
      displayName: "Ember.js",
      createdAt: "2024-04-10T20:43:12.126Z",
      updatedAt: "2024-04-10T20:43:12.126Z",
    },
    {
      id: 15,
      title: "netlify-sdk",
      aliases: '{netlify-sdk,"netlify sdk",@netlify/sdk}',
      classification: "framework",
      displayName: "Netlify SDK",
      createdAt: "2024-04-10T20:36:45.030Z",
      updatedAt: "2024-04-10T20:36:45.030Z",
    },
    {
      id: 16,
      title: "mui",
      aliases: "{mui,@material-ui/core}",
      classification: "framework",
      displayName: "MUI",
      createdAt: "2024-04-10T20:37:28.057Z",
      updatedAt: "2024-04-10T20:37:28.057Z",
    },
    {
      id: 11,
      title: "redwoodjs",
      aliases: "{redwoodjs,redwood,redwood.js,@redwoodjs/core}",
      classification: "framework",
      displayName: "RedwoodJS",
      createdAt: "2024-04-10T20:28:15.838Z",
      updatedAt: "2024-04-10T20:28:15.838Z",
    },
    {
      id: 21,
      title: "i18n",
      aliases: "{i18n,next-i18next}",
      classification: "framework",
      displayName: "i18n",
      createdAt: "2024-04-10T20:41:47.491Z",
      updatedAt: "2024-04-10T20:41:47.491Z",
    },
    {
      id: 24,
      title: "bull",
      aliases: "{bull,bullmq}",
      classification: "framework",
      displayName: "Bull",
      createdAt: "2024-04-10T21:26:27.317Z",
      updatedAt: "2024-04-10T21:26:27.317Z",
    },
    {
      id: 25,
      title: "biome",
      aliases: "{biome,biomejs}",
      classification: "framework",
      displayName: "Biome",
      createdAt: "2024-04-19T23:02:20.489Z",
      updatedAt: "2024-04-19T23:02:20.489Z",
    },
    {
      id: 26,
      title: "react-compiler",
      aliases: '{react-compiler,"react compiler"}',
      classification: "framework",
      displayName: "React Compiler",
      createdAt: "2024-04-29T19:23:46.437Z",
      updatedAt: "2024-04-29T19:23:46.437Z",
    },
    {
      id: 27,
      title: "react-forget",
      aliases: '{react-forget,"react forget"}',
      classification: "framework",
      displayName: "React Forget",
      createdAt: "2024-04-29T19:24:23.521Z",
      updatedAt: "2024-04-29T19:24:23.521Z",
    },
    {
      id: 29,
      title: "react-native",
      aliases: '{react-native,"react native"}',
      classification: "framework",
      displayName: "React-Native",
      createdAt: "2024-04-30T17:43:43.570Z",
      updatedAt: "2024-04-30T17:43:43.570Z",
    },
    {
      id: 30,
      title: "prettier",
      aliases: "{prettier}",
      classification: "framework",
      displayName: "Prettier",
      createdAt: "2024-04-30T18:30:10.055Z",
      updatedAt: "2024-04-30T18:30:10.055Z",
    },
    {
      id: 31,
      title: "nuxt",
      aliases: "{nuxt}",
      classification: "framework",
      displayName: "Nuxt",
      createdAt: "2024-07-19T00:18:15.450Z",
      updatedAt: "2024-07-19T00:18:15.450Z",
    },
    {
      id: 33,
      title: "node.js",
      aliases: "{node,nodejs,node.js}",
      classification: "framework",
      displayName: "Node.js",
      createdAt: "2024-11-10T06:57:19.520Z",
      updatedAt: "2024-11-10T06:57:19.520Z",
    },
  ],
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;

  const qParts: string[] = [];

  // ?framework=title -> tag:alias1 tag:alias2 ...
  const frameworkTitle = searchParams.get("framework");
  if (frameworkTitle) {
    const aliases = getFrameworkAliasesFromTags(frameworkTitle);
    if (aliases.length) {
      qParts.push(...aliases.map((a) => `tag:${a}`));
    } else {
      // Fallback: treat the input as a tag itself
      qParts.push(`tag:${frameworkTitle}`);
    }
  }

  // ?category=cat -> tag:cat
  const category = searchParams.get("category");
  if (category) {
    qParts.push(`tag:${category}`);
  }

  // ?author=name -> by:name
  const author = searchParams.get("author");
  if (author) {
    qParts.push(`by:${author}`);
  }

  if (qParts.length) {
    const q = encodeURIComponent(qParts.join(" "));
    return NextResponse.redirect(`https://app.codemod.com/registry/?q=${q}`);
  }

  return NextResponse.redirect("https://app.codemod.com/registry");
}

/**
 * Looks up a framework by its title (case-insensitive), then returns its alias list.
 * - Matches TAGS.Tag where classification === "framework" and title equals input (case-insensitive).
 * - Parses the non-JSON alias string like "{a,b,\"c d\"}" into an array.
 */
function getFrameworkAliasesFromTags(titleInput: string): string[] {
  const norm = normalize(titleInput);
  const frameworks = TAGS.Tag.filter(
    (t) => normalize(t.classification) === "framework",
  );

  // Try exact match by title first
  let framework = frameworks.find((t) => normalize(t.title) === norm);

  // If not found, also try displayName equality
  if (!framework) {
    framework = frameworks.find((t) => normalize(t.displayName) === norm);
  }

  // If still not found, optionally match by alias equality
  if (!framework) {
    framework = frameworks.find((t) =>
      parseAliases(t.aliases).map(normalize).includes(norm),
    );
  }

  return framework ? parseAliases(framework.aliases) : [];
}

/**
 * Parses strings like:
 *  "{next.js,nextjs,next}"
 *  "{\"best practices\"}"
 * into: ["next.js","nextjs","next"] or ["best practices"]
 */
function parseAliases(raw: string): string[] {
  if (!raw) return [];
  const inner = raw.trim().replace(/^\{|\}$/g, "");
  if (!inner) return [];

  // Match either "quoted phrases" or bare tokens up to a comma
  const regex = /"([^"]+)"|([^,{}]+)/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(inner))) {
    const token = (m[1] ?? m[2] ?? "").trim();
    if (token) out.push(token);
  }
  // De-dupe while preserving order
  return Array.from(new Set(out));
}

function normalize(s: string) {
  return s.toLowerCase().trim();
}
