import { NextRequest, NextResponse } from "next/server";

const TAGS: Record<"framework" | "useCaseCategory", Record<string, string[]>> = {
  framework: {
    "next.js": ["next.js", "nextjs", "next"],
    react: ["react", "reactjs", "react.js"],
    typescript: ["typescript"],
    "react-router": ["react-router", "reactrouter", "react router"],
    "react-redux": ["react-redux", "reactredux", "react redux"],
    "next-i18next": ["next-i18next"],
    msw: ["msw", "mswjs", "mock service worker"],
    mocha: ["mocha"],
    jest: ["jest"],
    intuita: ["intuita"],
    eslint: ["eslint"],
    ember: ["ember", "emberjs", "ember.js"],
    "netlify-sdk": ["netlify-sdk", "netlify sdk", "@netlify/sdk"],
    mui: ["mui", "@material-ui/core"],
    redwoodjs: ["redwoodjs", "redwood", "redwood.js", "@redwoodjs/core"],
    i18n: ["i18n", "next-i18next"],
    bull: ["bull", "bullmq"],
    biome: ["biome", "biomejs"],
    "react-compiler": ["react-compiler", "react compiler"],
    "react-forget": ["react-forget", "react forget"],
    "react-native": ["react-native", "react native"],
    prettier: ["prettier"],
    nuxt: ["nuxt"],
    "node.js": ["node", "nodejs", "node.js"],
  },
  useCaseCategory: {
    migration: ["migration"],
    "best_practices": ["best practices"],
    refactoring: ["refactoring"],
    cleanup: ["cleanup"],
    mining: ["mining"],
    security: ["security"],
    other: ["other"],
  },
};

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function findAliases(category: keyof typeof TAGS, input: string): string[] {
  const norm = normalize(input);
  const categoryMap = TAGS[category];

  if (categoryMap[norm]) {
    return categoryMap[norm];
  }

  for (const aliases of Object.values(categoryMap)) {
    if (aliases.map(normalize).includes(norm)) {
      return aliases;
    }
  }

  return [];
}

// --- GET handler ---
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;

  const qParts: string[] = [];

  // ?framework=title -> tag:alias1 tag:alias2 ...
  const frameworkTitle = searchParams.get("framework");
  if (frameworkTitle) {
    const aliases = findAliases("framework", frameworkTitle);
    if (aliases.length) {
      qParts.push(...aliases.map((a) => `tag:${a}`));
    } else {
      qParts.push(`tag:${frameworkTitle}`);
    }
  }

  // ?category=cat -> tag:cat
  const category = searchParams.get("category");
  if (category) {
    const aliases = findAliases("useCaseCategory", category);
    if (aliases.length) {
      qParts.push(...aliases.map((a) => `tag:${a}`));
    } else {
      qParts.push(`tag:${category}`);
    }
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
