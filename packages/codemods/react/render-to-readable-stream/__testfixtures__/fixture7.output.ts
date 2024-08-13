renderToReadableStream(document, {
  onError: handleException,
  context: appContext,
  identifierPrefix: prefix,
});