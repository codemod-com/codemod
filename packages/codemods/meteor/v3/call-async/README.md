This codemod replaces call with callAsync, since thats how meteor works with calls now.

## Example

### Before

```ts
import { Meteor } from 'meteor/meteor';

Meteor.methods({
  async getAllData() {
    return await MyCollection.find().fetch();
  },
  async otherMethod() {
    return await MyCollection.find().fetch();
  },
});

Meteor.call('getAllData');
Meteor.call('otherMethod');
```

### After

```ts
import { Meteor } from 'meteor/meteor';

Meteor.methods({
  async getAllData() {
    return await MyCollection.find().fetchAsync();
  },
  async otherMethod() {
    return await MyCollection.find().fetchAsync();
  },
});

await Meteor.callAsync('getAllData');
await Meteor.callAsync('otherMethod');
```

