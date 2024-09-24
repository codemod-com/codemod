This codemod reaplces Meteor.user with Meteor.userAsync.

## Example

### Before

```ts
const user = Meteor.user();
```

### After

```ts
const user = await Meteor.userAsync();
```

