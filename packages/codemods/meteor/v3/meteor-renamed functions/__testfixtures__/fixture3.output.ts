async function someFunction() {
  const binary = await Assets.getBinaryAsync('some-file.txt');
  return binary;
}