export * from "./rules";

// @TODO ask if we can use some validation lib like yup or similar

export type ValidationRule = (value: string) => string;

export let validateValue = (value: string, rule: ValidationRule): string =>
  rule(value);
