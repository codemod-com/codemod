import { useTracker, useSubscribe } from 'meteor/react-meteor-data/suspense';

function Tasks() {
  useSubscribe('tasks');
  const { username } = useTracker('user', () => Meteor.userAsync());
  const tasksByUser = useTracker('tasksByUser', () =>
    TasksCollection.find({ username }, { sort: { createdAt: -1 } }, ).fetchAsync(),
  );
}