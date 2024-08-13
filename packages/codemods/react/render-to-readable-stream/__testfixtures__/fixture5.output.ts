renderToReadableStream(template, {
  onError: handleException,
  context: requestContext,
  identifierPrefix: prefix,
});