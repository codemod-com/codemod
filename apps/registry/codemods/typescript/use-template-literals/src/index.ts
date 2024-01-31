import type { API, FileInfo } from 'jscodeshift';

const isStringLiteral = (node) => node && node.type === 'StringLiteral';

const transformHelper = (node, api: API) => {
	const j = api.jscodeshift;
	const leftNode = node.left;
	const rightNode = node.right;
	const left =
		leftNode && leftNode.type === 'StringLiteral'
			? j.literal(`${leftNode.value}`)
			: leftNode;
	const right =
		rightNode && rightNode.type === 'StringLiteral'
			? j.literal(`${rightNode.value}`)
			: rightNode;

	return j.templateLiteral(
		[
			j.templateElement({ raw: '', cooked: '' }, false),
			j.templateElement({ raw: '', cooked: '' }, true),
		],
		[left, right],
	);
};
/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
export default function transformer(file: FileInfo, api: API) {
	const j = api.jscodeshift;
	const root = j(file.source);

	root.find(j.BinaryExpression, { operator: '+' })
		.filter(
			(path) =>
				isStringLiteral(path.node.left) ||
				isStringLiteral(path.node.right),
		)
		.forEach((path) => transformHelper(path.node, api));

	return root.toSource();
}
