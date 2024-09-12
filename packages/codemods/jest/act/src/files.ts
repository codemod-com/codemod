import { astGrep, contexts } from "@codemod.com/workflow";
import { LinesAndColumns } from "lines-and-columns";

export async function getLineBoundaries(line: number) {
  const file = contexts.getFileContext();
  const contents = await file.contents();
  const searchLines = new LinesAndColumns(contents);
  const startIndex = searchLines.indexForLocation({
    line: line - 1,
    column: 0,
  });
  const endIndex = searchLines.indexForLocation({
    line: line,
    column: 0,
  });
  if (!startIndex || !endIndex) {
    return;
  }

  return {
    startIndex,
    endIndex,
  };
}

export async function addActImport() {
  if (
    !(await astGrep`rule:
  pattern:
    context: import { act } from 'react'
    selector: import_specifier`.exists())
  ) {
    const file = contexts.getFileContext();
    const updatedContents = await file.contents();
    file.setContents(`import { act } from 'react';\n${updatedContents}`);
    await file.save();
  }
}

export async function addWaitForImport() {
  if (
    !(await astGrep`rule:
  pattern:
    context: import { waitFor } from '~test/helpers'
    selector: import_specifier`.exists())
  ) {
    const file = contexts.getFileContext();
    const updatedContents = await file.contents();
    file.setContents(
      `import { waitFor } from '~test/helpers';\n${updatedContents}`,
    );
    await file.save();
  }
}

export async function wrapExpressionWithinBoundaries(
  {
    startIndex,
    endIndex,
  }: {
    startIndex: number;
    endIndex: number;
  },
  wrapperToAdd: "act" | "waitFor",
  makeAsyncArg?: boolean,
) {
  let shoudAddReactImportAct = false;
  await astGrep`rule:
  kind: expression_statement`.replace(({ getNode }) => {
    const expression = getNode();

    if (expression.find("waitFor($$$_)") || expression.find("act($$$_)")) {
      return;
    }

    let parent = expression.parent();
    while (parent) {
      if (
        parent.kind() === "call_expression" &&
        ["act", "waitFor"].includes(parent.child(0)?.text() ?? "")
      ) {
        return;
      }
      parent = parent.parent();
    }

    let isAsync = false;
    parent = expression.parent();
    while (parent) {
      if (parent.kind() === "arrow_function") {
        if (parent.text().startsWith("async")) {
          isAsync = true;
        }
        break;
      }
      parent = parent.parent();
    }

    const nodeStart = expression.range().start.index;
    const nodeEnd = expression.range().end.index;
    const makeAsync = makeAsyncArg && isAsync;
    const replacement =
      (startIndex <= nodeStart && nodeStart <= endIndex) ||
      (startIndex <= nodeEnd && nodeEnd <= endIndex)
        ? `${makeAsync ? "await " : ""}${wrapperToAdd}(${makeAsync ? "async " : ""}() => { ${expression.text()} });`
        : undefined;

    if (replacement) {
      shoudAddReactImportAct = true;
    }

    return replacement;
  });

  return shoudAddReactImportAct;
}
