export function sanitizeString(str: string) {
  return str.replace(/[\r\n\t\u200B-\u200D\uFEFF]+/g, "").trim();
}

/**
 * Limits a string to a certain length for UI or SEO purposes.
 *
 * Dive further: https://hdoro.dev/javascript-truncation
 */
export function truncate(str: string, maxLength: number) {
  if (str.length < maxLength) {
    return str;
  }

  // To prevent truncating in the middle of words, let's get
  // the position of the first whitespace after the truncation
  let firstWhitespaceAfterTruncation =
    str.slice(maxLength).search(/\s/) + maxLength;

  return `${str.slice(0, firstWhitespaceAfterTruncation)}...`;
}

export function capitalize(str: string) {
  if (typeof str !== "string") {
    return str;
  }
  return str?.[0] ? `${str[0].toUpperCase()}${str.slice(1) || ""}` : "";
}

/**
 * Makes a string URL-friendly.
 * Removes special characters, spaces, upper-cased letters.
 */
export function slugify(str: string) {
  let acceptedCharacters = [
    "a-z", // lower-case letters
    "0-9", // numbers
    " ", // spaces
    "\\-", // hyphens (escaped)
  ];

  return str
    .toString()
    .normalize("NFD") // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .toLowerCase()
    .replace(new RegExp(`[^${acceptedCharacters.join("")}]`, "g"), "")
    .replace(/\s+/g, "-")
    .trim();
}

export function removeSpecialChars(str: string) {
  return sanitizeString(str)
    .replace(/(?!\w|\s)./g, "")
    .replace(/\s+/g, " ")
    .replace(/^(\s*)([\W\w]*)(\b\s*$)/g, "$2");
}

export function unslugify(str: string) {
  return str
    .replace(/-|_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function insertMergeTags(
  text: string,
  mergeTags: Record<string, string>,
) {
  return text.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    return mergeTags[key.trim()] || "";
  });
}

export let FEATURE_FLAG_QUERY_KEY = "ff";
export let CODEMOD_RUN_FEATURE_FLAG = "codemod-run";
export let CODEMOD_AI_FEATURE_FLAG = "codemod-ai";
export let CODEMOD_MOD_SERVICE_FEATURE_FLAG = "mod";
