const Future = Npm.require('fibers/future');

function someFunction() {
  const future = new Future();
  someAsyncFunction((error, result) => {
    if (error) {
      future.throw(error);
    } else {
      future.return(result);
    }
  });
  return future.wait();
}