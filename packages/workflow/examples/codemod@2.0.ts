import type { Api } from "@codemod.com/workflow";

export async function workflow({ jsFiles }: Api) {
  const response = await jsFiles`**/*.input.ts`.astGrep(
    "$SCHEMA($$$REST, [$$$ACTIONS])",
  ).ai`
    SCHEMA could be one of 'any', 'array', 'bigint', 'blob', 'boolean', 'custom', 'date', 'enum_', 'instance', 'intersect',
    'lazy', 'literal', 'looseObject', 'looseTuple', 'map', 'nan', 'never', 'nonNullable', 'nonNullish', 'nonOptional',
    'null_', 'nullable', 'nullish', 'number', 'object', 'objectWithRest', 'optional', 'picklist', 'record', 'set',
    'strictObject', 'strictTuple', 'string', 'symbol', 'tuple', 'tupleWithRest', 'undefined_', 'union', 'unknown', 'variant',
    'void_'
    ACTIONS is array of calls to one of 'bic', 'brand', 'bytes', 'check', 'creditCard', 'cuid2', 'decimal', 'email',
    'emoji', 'empty', 'endsWith', 'every', 'excludes', 'finite', 'hash', 'hexadecimal', 'hexColor', 'imei', 'includes',
    'integer', 'ip', 'ipv4', 'ipv6', 'isoDate', 'isoDateTime', 'isoTime', 'isoTimeSecond', 'isoTimestamp', 'isoWeek',
    'length', 'mac', 'mac48', 'mac64', 'maxBytes', 'maxLength', 'maxSize', 'maxValue', 'mimeType', 'minBytes',
    'minLength', 'minSize', 'minValue', 'multipleOf', 'nonEmpty', 'notBytes', 'notLength', 'notSize', 'notValue', 'octal',
    'readonly', 'regex', 'safeInteger', 'size', 'some', 'startsWith', 'toLowerCase', 'toMaxValue', 'toMinValue', 'toUpperCase',
    'transform', 'trim', 'trimEnd', 'trimStart', 'ulid', 'url', 'uuid', 'value','forward'
    
    If $SCHEMA is not one of SCHEMA, skip
    If $$$ACTIONS is not one of ACTIONS, skip

    If skipping - return same string

    Take into account recursive replacements
    
    Example
    Before: v.string('some string', [v.email()])
    After: v.pipe(v.string('some string'), v.email())
    `;
}
