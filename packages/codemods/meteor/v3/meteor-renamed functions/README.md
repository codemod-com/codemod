


This codemod automates the migration of your Meteor project to version 3, updating function calls and modernizing your codebase to their renamed functions. 

You can find the implementation of this codemod in the studio [here](https://go.codemod.com/8OZx88x)

## Table of Contents

- [Overview](#overview)
- [Usage](#usage)
- [Examples](#examples)

## Overview

This codemod performs the following transformations:
- Converts synchronous function calls to their asynchronous counterparts.
- Renames functions according to new API changes in Meteor v3.



## Examples

### Example 1: Synchronous to Asynchronous Function Conversion

This codemod turns synchronous function calls into their asynchronous equivalents.

#### Before

```ts
function someFunction(userId, newPassword) {
  Accounts.setPassword(userId, newPassword);
}
```

#### After

```ts
async function someFunction(userId, newPassword) {
  await Accounts.setPasswordAsync(userId, newPassword);
}
```

### Example 2: Asset Retrieval Update

This codemod updates asset retrieval functions to use their asynchronous versions.

#### Before

```ts
function someFunction() {
  const text = Assets.getText('some-file.txt');
  return text;
}
```

#### After

```ts
async function someFunction() {
  const text = await Assets.getTextAsync('some-file.txt');
  return text;
}
```

### Example 3: Binary Asset Retrieval Update

#### Before

```ts
function someFunction() {
  const binary = Assets.getBinary('some-file.txt');
  return binary;
}
```

#### After

```ts
async function someFunction() {
  const binary = await Assets.getBinaryAsync('some-file.txt');
  return binary;
}
```

### Example 4: Email Addition Update

This codemod updates the `Accounts.addEmail` function to its asynchronous version.

#### Before

```ts
Accounts.addEmail(
  'userId',
  'newEmail',
  false, // this param is optional
);
```

#### After

```ts
await Accounts.addEmailAsync(
  'userId',
  'newEmail',
  false, // this param is optional
);
```

