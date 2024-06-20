export let capitalizeWord = (str: string): string => {
  if (str.length === 0) {
    return str;
  }

  let firstLetter = str[0]?.toUpperCase();
  let restOfWord = str.slice(1).toLowerCase();

  return firstLetter + restOfWord;
};
