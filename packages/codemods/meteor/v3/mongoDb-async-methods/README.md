

This codemod updates synchronous MongoDB operations in a Meteor project to use their asynchronous counterparts, making the code compatible with modern JavaScript best practices (using `async/await`). It transforms methods such as `find`, `findOne`, `insert`, `update`, `remove`, and `upsert` to their asynchronous equivalents by appending `Async` to method names and introducing `await`.

### Example

This codemod converts synchronous MongoDB queries and updates into asynchronous methods for better code readability, performance, and error handling.

### Before

```ts
const docs = MyCollection.find({ _id: '123' }).fetch();
const doc = MyCollection.findOne({ _id: '123' });
```

### After

```ts
const docs = await MyCollection.find({ _id: '123' }).fetchAsync();
const doc = await MyCollection.findOneAsync({ _id: '123' });
```

### Transformations

This codemod handles various MongoDB operations and converts them into asynchronous functions.

#### Example 1: Fetching documents

**Before:**

```ts
const docs = MyCollection.find({ _id: '123' }).fetch();
```

**After:**

```ts
const docs = await MyCollection.find({ _id: '123' }).fetchAsync();
```

#### Example 2: Fetching a single document

**Before:**

```ts
const doc = MyCollection.findOne({ _id: '123' });
```

**After:**

```ts
const doc = await MyCollection.findOneAsync({ _id: '123' });
```

#### Example 3: Updating documents

**Before:**

```ts
MyCollection.update({ _id: '123' }, { $set: { name: 'John' } });
const updatedDocument = MyCollection.findOne({ _id: '123' });
```

**After:**

```ts
await MyCollection.updateAsync({ _id: '123' }, { $set: { name: 'John' } });
const updatedDocument = await MyCollection.findOneAsync({ _id: '123' });
```

#### Example 4: Inserting, updating, removing, and upserting documents

**Before:**

```ts
MyCollection.insert({ name: 'Jane', age: 30 });
MyCollection.update({ _id: '123' }, { $set: { name: 'John' } });
MyCollection.remove({ _id: '123' });
MyCollection.upsert({ _id: '123' }, { $set: { name: 'John' } });
```

**After:**

```ts
await MyCollection.insertAsync({ name: 'Jane', age: 30 });
await MyCollection.updateAsync({ _id: '123' }, { $set: { name: 'John' } });
await MyCollection.removeAsync({ _id: '123' });
await MyCollection.upsertAsync({ _id: '123' }, { $set: { name: 'John' } });
```

---

This codemod simplifies migration from synchronous MongoDB methods to their asynchronous versions, improving performance and allowing better control over the code execution flow.