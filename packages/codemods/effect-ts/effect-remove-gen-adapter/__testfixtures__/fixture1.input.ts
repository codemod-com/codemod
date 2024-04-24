Effect2.gen(function* (XXX) {
  const a = yield* XXX(Effect.succeed(0));
  const b = yield* XXX(Effect.succeed(1));
  return a + b;
});
