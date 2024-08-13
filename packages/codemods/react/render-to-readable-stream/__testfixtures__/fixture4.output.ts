renderToReadableStream(view, {
  onError: handleFailure,
  context: sessionContext,
  identifierPrefix: prefix,
});