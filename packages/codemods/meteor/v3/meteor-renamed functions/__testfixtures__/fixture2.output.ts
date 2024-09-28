async function someFunction() {
  const text = await Assets.getTextAsync('some-file.txt');
  return text;
}