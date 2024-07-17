import * as os from "node:os";
import { homedir } from "node:os";
import { join } from "node:path";
import type { GetUserDataResponse } from "@codemod-com/api-types";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import { execPromise, isNeitherNullNorUndefined } from "@codemod-com/utilities";
import { glob } from "glob";
import inquirer from "inquirer";
import keytar from "keytar";
import { getUserData } from "./apis";
import { handleLoginCliCommand } from "./commands/login";

type UserData = GetUserDataResponse & {
  account: string;
  token: string;
};

export const getUserCredentials = async (): Promise<{
  account: string;
  password: string;
} | null> => {
  try {
    return (await keytar.findCredentials("codemod.com"))[0] ?? null;
  } catch (err) {
    if (os.platform() === "linux") {
      throw new Error(
        chalk(
          `Codemod CLI uses "keytar" to store your credentials securely.`,
          `\nPlease make sure you have "libsecret" installed on your system.`,
          "\nDepending on your distribution, you will need to run the following command",
          "\nDebian/Ubuntu:",
          chalk.bold("sudo apt-get install libsecret-1-dev"),
          "\nFedora:",
          chalk.bold("sudo dnf install libsecret"),
          "\nArch Linux:",
          chalk.bold("sudo pacman -S libsecret"),
          `\n\n${String(err)}`,
        ),
      );
    }

    throw err;
  }
};

export const getCurrentUserData = async (): Promise<UserData | null> => {
  const userCredentials = await getUserCredentials();

  if (!isNeitherNullNorUndefined(userCredentials)) {
    return null;
  }

  const { account, password: token } = userCredentials;

  const responseData = await getUserData(token);

  if (responseData === null) {
    await keytar.deletePassword("codemod.com", account);
    return null;
  }

  return { ...responseData, token, account: userCredentials.account };
};

export const getCurrentUserOrLogin = async (options: {
  message: string;
  printer: PrinterBlueprint;
  onEmptyAfterLoginText?: string;
}) => {
  const { message, printer } = options;

  let userData = await getCurrentUserData();

  if (userData !== null) {
    return userData;
  }

  const { login } = await inquirer.prompt<{ login: boolean }>({
    type: "confirm",
    name: "login",
    message,
  });

  if (!login) {
    throw new Error(
      "Refused to login for a command that requires authentication. Aborting...",
    );
  }

  await handleLoginCliCommand({ printer });
  userData = await getCurrentUserData();

  if (userData === null) {
    throw new Error(
      options.onEmptyAfterLoginText ??
        "Unexpected empty user data after authentication. Aborting...",
    );
  }

  return userData;
};

export const getOrgsNames = (
  userData: UserData,
  type: "slug" | "name" | "slug-and-name" = "slug",
): string[] => {
  let mapFunc: (org: UserData["organizations"][number]) => string | null;
  switch (type) {
    case "slug":
      mapFunc = (org) => org.organization.slug;
      break;
    case "name":
      mapFunc = (org) => org.organization.name;
      break;
    case "slug-and-name":
      mapFunc = (org) => {
        if (org.organization.name === org.organization.slug) {
          return org.organization.name;
        }

        return `${org.organization.name} (${org.organization.slug})`;
      };
      break;
    default:
      throw new Error("Invalid type");
  }

  return userData.organizations.map(mapFunc).filter(isNeitherNullNorUndefined);
};

export const initGlobalNodeModules = async (): Promise<void> => {
  const globalPaths = await Promise.allSettled([
    execPromise("npm root -g"),
    execPromise("pnpm root -g"),
    execPromise("yarn global dir"),
    execPromise("echo $BUN_INSTALL/install/global/node_modules"),
  ]);
  process.env.NODE_PATH = globalPaths
    .map((res) => (res.status === "fulfilled" ? res.value.stdout.trim() : null))
    .filter(Boolean)
    .join(":");
  require("node:module").Module._initPaths();
};

export const getConfigurationDirectoryPath = (argvUnderScore?: unknown) =>
  join(
    String(argvUnderScore) === "runOnPreCommit" ? process.cwd() : homedir(),
    ".codemod",
  );

export const rebuildCodemodFallback = async (options: {
  globPattern: string | string[];
  source: string;
  errorText: string;
  onSuccess?: () => void;
  onFail?: () => void;
}): Promise<string> => {
  const { globPattern, source, errorText, onSuccess, onFail } = options;

  const locateMainFile = async () => {
    const mainFiles = await glob(globPattern, {
      absolute: true,
      ignore: ["**/node_modules/**"],
      cwd: source,
      nodir: true,
    });

    return mainFiles.at(0);
  };

  let mainFilePath = await locateMainFile();

  try {
    // Try to build the codemod anyways, and if after build there is still no main file
    // or the process throws - throw an error
    await execPromise("codemod build", { cwd: source });

    mainFilePath = await locateMainFile();
    // Likely meaning that the "codemod build" command succeeded, but the file was still not found in output
    if (mainFilePath === undefined) {
      throw new Error();
    }
    onSuccess?.();
  } catch (error) {
    onFail?.();
    throw new Error(errorText);
  }

  return mainFilePath;
};

export const oraCheckmark = chalk.green("✔");
export const oraCross = chalk.red("✖");

const generateCodemodContext = `### Context
- You will be provided with BEFORE and AFTER code snippet pairs.
- Write a single jscodeshift codemod that transforms each BEFORE snippet into the AFTER snippet.
- Identify common patterns and create a generic codemod to handle all cases.
- Use only jscodeshift and TypeScript.
- If comments in AFTER snippets describe the transformation, do not preserve them.
- Only include a code block in your response, no extra explanations.
- Comment your code following best practices.
- Do not import 'namedTypes' or 'builders' from jscodeshift.
- Always narrow node types using typeguards before accessing their properties.
`;

const improveCodemodContext = `### Context
- You will be provided with BEFORE and AFTER code snippet pairs and an existing codemod that might or might not satisfy them.
- An existing codemod is located in a zip archive sent to you.
- Use the provided jscodeshift codemod and see whether it would turn each BEFORE snippet into corresponding AFTER snippet.
- Identify common patterns and improve the codemod to handle all cases.
- Use only jscodeshift and TypeScript.
- If comments in AFTER snippets describe the transformation, do not preserve them.
- Only include the download link for the archive with updated code in your response, no extra explanations or text.
- Comment your code following best practices.
- Do not import 'namedTypes' or 'builders' from jscodeshift.
- Always narrow node types using typeguards before accessing their properties.
`;

const jscodeshiftUsageExamples = `Here are two examples of using typeguards to check whether the import source is a string literal:
\`\`\`typescript
if (j.Literal.check(node.source)) { // CORRECT
  // rest of the code
}

if (j.Literal.check(node.source) && typeof node.source.value === 'string') { // CORRECT
  // rest of the code
}
\`\`\`


- Never check the node type without using typeguards. The following example is INCORRECT:
\`\`\`typescript
if (node.source.type === 'Literal') { // INCORRECT
  // rest of the code
}
\`\`\`

### Examples
#### Example 1
**BEFORE**:
\`\`\`typescript
import { A } from '@ember/array';
let arr = new A();
\`\`\`
**AFTER**:
\`\`\`typescript
import { A as emberA } from '@ember/array';
let arr = A();
\`\`\`
**CODEMOD**:
\`\`\`typescript
export default function transform(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);
    root.find(j.NewExpression, { callee: { name: "A" } }).replaceWith(() => {
        root.find(j.ImportSpecifier, {
            imported: { name: "A" },
            local: { name: "A" }
        }).replaceWith(() => {
            return j.importSpecifier(j.identifier("A"), j.identifier("emberA"));
        });
        return j.callExpression(j.identifier("A"), []);
    });
    return root.toSource();
}
\`\`\`

#### Example 2
**BEFORE**:
\`\`\`typescript
import { Route, Router } from 'react-router-dom';
const MyApp = () => (
    <Router history={history}>
        <Route path='/posts' component={PostList} />
        <Route path='/posts/:id' component={PostEdit} />
        <Route path='/posts/:id/show' component={PostShow} />
        <Route path='/posts/:id/delete' component={PostDelete} />
    </Router>
);
\`\`\`
**AFTER**:
\`\`\`typescript
import { Route, Router } from 'react-router-dom';
const MyApp = () => (
    <Router history={history}>
        <Switch>
            <Route path='/posts' component={PostList} />
            <Route path='/posts/:id' component={PostEdit} />
            <Route path='/posts/:id/show' component={PostShow} />
            <Route path='/posts/:id/delete' component={PostDelete} />
        </Switch>
    </Router>
);
\`\`\`
**CODEMOD**:
\`\`\`typescript
import type { API, FileInfo, Options, Transform } from "jscodeshift";
function transform(file: FileInfo, api: API, options: Options): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);
	root.find(j.JSXElement, {
		openingElement: { name: { name: "Router" } }
	}).forEach((path) => {
		const hasSwitch = root.findJSXElements("Switch").length > 0;
		if (hasSwitch) {
			return;
		}
		const children = path.value.children;
		const newEl = j.jsxElement(
			j.jsxOpeningElement(j.jsxIdentifier("Switch"), [], false),
			j.jsxClosingElement(j.jsxIdentifier("Switch")),
			children
		);
		path.value.children = [j.jsxText("\\n  "), newEl, j.jsxText("\\n")];
	});
	return root.toSource(options);
}
export default transform;
\`\`\`

#### Example 3
**BEFORE**:
\`\`\`typescript
import { Redirect, Route } from 'react-router';
\`\`\`
**AFTER**:
\`\`\`typescript
import { Redirect, Route } from 'react-router-dom';
\`\`\`
**CODEMOD**:
\`\`\`typescript
import type { API, FileInfo, Options, Transform } from 'jscodeshift';
function transform(file: FileInfo, api: API, options: Options): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);
	root.find(j.ImportDeclaration, {
		source: { value: 'react-router' }
	}).forEach((path) => {
		path.value.source.value = 'react-router-dom';
	});
	return root.toSource(options);
}
export default transform;
\`\`\`

## Additional API about jscodeshift
### closestScope: Finds the closest enclosing scope of a node. Useful for determining the scope context of variables and functions.
\`\`\`typescript
const closestScopes = j.find(j.Identifier).closestScope();
\`\`\`

### some: checks if at least one element in the collection passes the test implemented by the provided function.
\`\`\`typescript
const hasVariableA = root.find(j.VariableDeclarator).some(path => path.node.id.name === 'a');
\`\`\`

### map: Maps each node in the collection to a new value.
\`\`\`typescript
const variableNames = j.find(j.VariableDeclaration).map(path => path.node.declarations.map(decl => decl.id.name));
\`\`\`

### paths: Returns the paths of the found nodes.
\`\`\`typescript
const paths = j.find(j.VariableDeclaration).paths();
\`\`\`

### get: Gets the first node in the collection.
\`\`\`typescript
const firstVariableDeclaration = j.find(j.VariableDeclaration).get();
\`\`\`

### at: Navigates to a specific path in the AST.
\`\`\`typescript
const secondVariableDeclaration = j.find(j.VariableDeclaration).at(1);
\`\`\`

### isOfType: checks if the node in the collection is of a specific type.
\`\`\`typescript
const isVariableDeclarator = root.find(j.VariableDeclarator).at(0).isOfType('VariableDeclarator');
\`\`\`
`;

export function getCodemodPrompt(options: {
  type: "generate";
  testCases: { before: string; after: string }[];
}): string;
export function getCodemodPrompt(options: {
  type: "improve";
  testCases: { before: string; after: string }[];
  existingCodemodSource: string;
}): string;
export function getCodemodPrompt(options: {
  type: "improve" | "generate";
  testCases: { before: string; after: string }[];
  existingCodemodSource?: string;
}) {
  const { type, testCases, existingCodemodSource } = options;

  return `${type === "generate" ? generateCodemodContext : improveCodemodContext}

${
  type === "improve"
    ? `\n\n### Existing Codemod
\`\`\`typescript
${existingCodemodSource}
\`\`\`
`
    : ""
}

### Input Snippets


${testCases
  .map(
    ({ before, after }, i) => `## Input ${i + 1}
**BEFORE**:
\`\`\`typescript
${before}
\`\`\`
**AFTER**:
\`\`\`typescript
${after}
\`\`\`
`,
  )
  .join("\n")}


${jscodeshiftUsageExamples}
`;
}
