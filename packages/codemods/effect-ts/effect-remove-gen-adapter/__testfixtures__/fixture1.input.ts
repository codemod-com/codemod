Effect.gen(function* (XXX) {
  const a = yield* XXX(Effect.succeed(0));
  const b = yield* XXX(Effect.succeed(1));
  const c = yield* XXX(
    [Effect.succeed(0), Effect.succeed(1)] as const,
    Effect.allWith(),
  );
  return a + b + c;
});
