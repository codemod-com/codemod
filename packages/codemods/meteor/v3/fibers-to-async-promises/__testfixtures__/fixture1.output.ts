async function someFunction() {
  return new Promise((resolve, reject) => {
    someAsyncFunction((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}