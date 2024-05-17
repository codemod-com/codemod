export let insertValue = (
  textArea: HTMLTextAreaElement,
  input: string,
  value: string,
) => {
  let startPos = textArea.selectionStart;
  return `${input.substring(0, startPos)} ${value} ${input.substring(
    startPos,
  )}`;
};
