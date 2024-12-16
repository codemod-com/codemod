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