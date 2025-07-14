function example() {
  logger.log("Hello world");
  logger.log("Debug message");
  logger.log(42);
  logger.log(variable);
  
  // These should not be transformed
  console.error("Error message");
  console.warn("Warning");
  
  // Nested cases
  if (condition) {
    logger.log("Nested log");
    logger.log("Nested debug");
  }
}

const data = {
  value: 123
};

logger.log(data);
console.debug("Processing data:", data.value);
