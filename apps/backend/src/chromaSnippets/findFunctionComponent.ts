export const findFunctionComponent = `
SNIPPET_DESCRIPTION:
Finds Page component function; 
Finds the FunctionDeclaration or ArrowFunctionExpression that is exported by default;

SNIPPET_CODE: 

function findPageComponentFunction(j: jscodeshift, root: Collection<File>) {
    const program = root.find(j.Program).paths()[0] ?? null;

if (program === null) {
    return null;
}

const defaultExport =
    root.find(j.ExportDefaultDeclaration).paths()[0] ?? null;
const defaultExportDeclaration = defaultExport?.value.declaration ?? null;

let pageComponentFunction:
    | FunctionDeclaration
    | ArrowFunctionExpression
    | FunctionExpression
    | null = null;

if (defaultExportDeclaration?.type === 'FunctionDeclaration') {
    pageComponentFunction = defaultExportDeclaration;
}

if (defaultExportDeclaration?.type === 'Identifier') {
    const program = root.find(j.Program).paths()[0] ?? null;

    (program?.value.body ?? []).forEach((node) => {
        let _node = node;

        // node can be within ExportNamedDeclaration
        if (
            j.ExportNamedDeclaration.check(node) &&
            (j.FunctionDeclaration.check(node.declaration) ||
                j.VariableDeclaration.check(node.declaration))
        ) {
            _node = node.declaration;
        }

        if (
            j.FunctionDeclaration.check(_node) &&
            _node.id?.name === defaultExportDeclaration.name
        ) {
            pageComponentFunction = _node;
        }

        if (
            j.VariableDeclaration.check(_node) &&
            j.VariableDeclarator.check(_node.declarations[0]) &&
            j.Identifier.check(_node.declarations[0].id) &&
            _node.declarations[0].id.name ===
                defaultExportDeclaration.name &&
            (j.ArrowFunctionExpression.check(_node.declarations[0].init) ||
                j.FunctionExpression.check(_node.declarations[0].init))
        ) {
            pageComponentFunction = _node.declarations[0].init;
        }
    });
}

return pageComponentFunction;
}
`;
