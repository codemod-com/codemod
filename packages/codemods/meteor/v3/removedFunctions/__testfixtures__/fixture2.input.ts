const wrappedFunction = Meteor.wrapAsync(someAsyncFunction);

function someFunction() {
  const result = wrappedFunction();
  return result;
}