export const insertValue = (
	textArea: HTMLTextAreaElement,
	input: string,
	value: string,
) => {
	const startPos = textArea.selectionStart;
	return `${ input.substring(0, startPos) } ${ value } ${ input.substring(
		startPos,
	) }`;
};
