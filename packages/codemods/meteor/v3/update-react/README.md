This codemod helps in transforming react to meteor

## Example

### Before

```ts
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';

function Tasks() {
  const isLoading = useSubscribe('tasks');
  const { username } = useTracker(() => Meteor.user());
  const tasksByUser = useTracker(() =>
    TasksCollection.find({ username }, { sort: { createdAt: -1 } }).fetch(),
  );

  if (isLoading()) {
    return < Loading / > ;
  }
}
```

### After

```ts
import { useTracker, useSubscribe } from 'meteor/react-meteor-data/suspense';

function Tasks() {
  useSubscribe('tasks');
  const { username } = useTracker('user', () => Meteor.userAsync());
  const tasksByUser = useTracker('tasksByUser', () =>
    TasksCollection.find({ username }, { sort: { createdAt: -1 } }, ).fetchAsync(),
  );
}
```

