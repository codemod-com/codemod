Effect.gen(function* () {
  const a = yield* Effect.succeed(0);
  const b = yield* Effect.succeed(1);
  const c = yield* pipe(
    [Effect.succeed(0), Effect.succeed(1)] as const,
    Effect.allWith(),
  );
  return a + b + c;
});
