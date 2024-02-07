# Migrate eslintrc to biome.json

## Description

Run this codemod to upgrade configuration files for eslint with corresponding biome.json for all the found rules replacements.

NOTE: Due to limitation of filemod engine being able to update one single file at a time, while having context of both, this codemod ignores eslintIgnore and eslintConfig fields in package.json files. You will need to manually update biome.json based on these fields if you need to.

NOTE: This codemod requires internet connection to fetch the rules replacements.

## Example

### `package.json`

### `.eslintrc.json`

### Before

```json
{
	...
}
```

### After

`Removed`

## Applicability Criteria

`eslint` >= 0.0.0 || `prettier` >= 0.0.0

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

[filemod](https://github.com/codemod-com/filemod/)

### Estimated Time Saving

4 hours per project with configured eslint and/or prettier

### Owner

[Codemod.com](https://github.com/codemod-com)
