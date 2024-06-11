import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import { doubleQuotify } from "@codemod-com/utilities";
import columnify from "columnify";
import terminalLink from "terminal-link";
import { getCodemodList } from "../apis.js";

export const handleListNamesCommand = async (options: {
  printer: PrinterBlueprint;
  search: string | null;
}) => {
  const { printer, search } = options;

  let spinner: ReturnType<typeof printer.withLoaderMessage> | null = null;
  if (search && !printer.__jsonOutput) {
    spinner = printer.withLoaderMessage(
      chalk.cyan("Searching for", chalk.bold(doubleQuotify(search))),
    );
  }

  const configObjects = await getCodemodList({ search });
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
        docs?: string;
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
        resultRow.name = terminalLink(resultRow.name, registryLink);
      } else {
        resultRow.docs = terminalLink(registryLink, registryLink, {
          fallback: false,
        });
      }

      return resultRow;
    },
  );

  if (search) {
    if (prettified.length === 0) {
      printer.printConsoleMessage(
        "info",
        chalk.bold.red("No results matched your search."),
      );
      return;
    }

    printer.printConsoleMessage(
      "info",
      chalk.bold.cyan("Here are the search results:\n"),
    );
  }

  printer.printConsoleMessage(
    "info",
    columnify(prettified, {
      headingTransform: (heading) => chalk.bold(heading.toLocaleUpperCase()),
    }),
  );
};
