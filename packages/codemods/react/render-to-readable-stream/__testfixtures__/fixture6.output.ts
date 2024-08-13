renderToReadableStream(page, {
  onError: handleError,
  context: userSession,
  identifierPrefix: prefix,
});