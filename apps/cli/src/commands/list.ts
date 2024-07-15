import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import { doubleQuotify } from "@codemod-com/utilities";
import columnify from "columnify";
import terminalLink from "terminal-link";
import { getCodemodList } from "../apis.js";
import { getCurrentUserOrLogin } from "../utils.js";

export const handleListNamesCommand = async (options: {
  printer: PrinterBlueprint;
  search: string | null;
  mine: boolean;
  all: boolean;
}) => {
  const { printer, search, mine, all } = options;

  if (search && search.length < 2) {
    throw new Error(
      "Search term must be at least 2 characters long. Aborting...",
    );
  }

  let spinner: ReturnType<typeof printer.withLoaderMessage> | null = null;
  if (search && !printer.__jsonOutput) {
    spinner = printer.withLoaderMessage(
      chalk.cyan("Searching for", chalk.bold(doubleQuotify(search))),
    );
  }

  await getCurrentUserOrLogin({
    message: "Authentication is required to view your own codemods. Proceed?",
    printer,
  });

  const configObjects = await getCodemodList({ search, mine, all });
  spinner?.stop();

  if (printer.__jsonOutput) {
    printer.printOperationMessage({
      kind: "codemodList",
      codemods: configObjects,
    });
    return;
  }

  const prettified = configObjects.map(
    ({ name, verified: _, tags: tagsArray, engine, author, slug }) => {
      const tags = tagsArray.join(", ");

      let resultRow: {
        name: string;
        tags: string;
        engine: string;
        author: string;
      } = {
        name,
        tags,
        engine,
        author,
      };

      if (search && (name === search || tagsArray.includes(search))) {
        resultRow = {
          name: chalk.bold.cyan(name),
          tags: chalk.bold.cyan(tags),
          engine: chalk.bold.cyan(engine),
          author: chalk.bold.cyan(author),
        };
      }

      const registryLink = `https://codemod.com/registry/${slug}`;

      if (terminalLink.isSupported) {
        resultRow.name = terminalLink(
          chalk.underline(resultRow.name),
          registryLink,
        );
      }

      return resultRow;
    },
  );

  if (prettified.length === 0) {
    printer.printConsoleMessage(
      "info",
      chalk.bold.red("No results matched your search."),
    );
    return;
  }

  if (search) {
    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan("Here are the search results:\n"),
    );
  } else if (mine) {
    const msg = "Here are all of your codemods";
    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan(all ? `${msg}:\n` : `${msg} (except hidden ones):\n`),
    );
  } else if (all) {
    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan("Here are all the codemods available to you:\n"),
    );
  }

  printer.printConsoleMessage(
    "info",
    columnify(prettified, {
      headingTransform: (heading) => chalk.bold(heading.toLocaleUpperCase()),
    }),
  );

  printer.printConsoleMessage(
    "info",
    chalk.cyan(
      terminalLink.isSupported
        ? "\nClick on the name of the codemod to visit its documentation page."
        : chalk(
            "\nVisit",
            chalk.bold("https://codemod.com/registry"),
            "to see the full list of codemods and their documentation.",
          ),
    ),
  );
};
