# Next-i18next Copy Keys

## Description

This codemod copies specific keys from one translation namespace to another, for each of the supported languages.

The codemod expects the following arguments:

-   `oldNamespace` is the name of the namespace from which the keys are taken,
-   `newNamespace` is the name of the namespace to which the keys are copied,
-   `keys` is a comma-separated list of keys.

You need to pass these arguments using the [Codemod Arguments' settings](https://docs.intuita.io/docs/vs-code-extension/advanced-usage#set-codemod-arguments) in Intuita VS Code extension or [Intuita CLI](https://docs.intuita.io/docs/cli/quickstart).

## Example:

### Before:

#### .../en/common.json

```json
{
	"copyKey": "copyKeyEnglish",
	"noopKey": "noopKeyEnglish"
}
```

#### .../en/new.json

```json
{
	"existingKey": "existingKeyEnglish"
}
```

### After:

#### .../en/common.json

```json
{
	"copyKey": "copyKeyEnglish",
	"noopKey": "noopKeyEnglish"
}
```

#### .../en/new.json

```json
{
	"existingKey": "existingKeyEnglish",
	"copyKey": "copyKeyEnglish"
}
```

## Applicability Criteria

`next-i18next > 14.x`

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

Filemod

### Estimated Time Saving

~1 minute per each key within each language file

### Owner

[Intuita](https://github.com/codemod-com)
