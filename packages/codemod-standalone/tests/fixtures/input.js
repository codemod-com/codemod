function example() {
  console.log("Hello world");
  console.log("Debug message");
  console.log(42);
  console.log(variable);

  // These should not be transformed
  console.error("Error message");
  console.warn("Warning");

  // Nested cases
  if (condition) {
    console.log("Nested log");
    console.log("Nested debug");
  }
}

const data = {
  value: 123
};

console.log(data);
console.debug("Processing data:", data.value);
