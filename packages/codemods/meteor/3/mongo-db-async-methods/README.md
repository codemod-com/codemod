This codemod transforms `insert`, `update`, `remove`, `find`, `findOne`, `upsert` methods that no longer work in the server to their `async` counterparts in Meteor.js v3.

## Example

### Before

```ts
const someVariable = MyCollection.find({ _id: '123' }).fetch();
const someVariable = MyCollection.findOne({ _id: '123' }).fetch();
const someVariable = MyCollection.insert({ _id: '123' }).fetch();
const someVariable = MyCollection.upsert({ _id: '123' }).fetch();
const someVariable = MyCollection.update({ _id: '123' }).fetch();
const someVariable = MyCollection.remove({ _id: '123' }).fetch();
```

### After

```ts
const someVariable = await MyCollection.findAsync({ _id: '123' });
const someVariable = await MyCollection.findOneAsync({ _id: '123' });
const someVariable = await MyCollection.insertAsync({ _id: '123' });
const someVariable = await MyCollection.upsertAsync({ _id: '123' });
const someVariable = await MyCollection.updateAsync({ _id: '123' });
const someVariable = await MyCollection.removeAsync({ _id: '123' });
```
