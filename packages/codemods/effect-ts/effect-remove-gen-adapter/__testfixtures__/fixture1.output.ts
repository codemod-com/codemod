//find Effect.gen(functions*(SOMETHING). and then remove that SOMETHING identifier and any other usages of that identifier within that expression.

Effect.gen(function* () {
  const a = yield* Effect.succeed(0);
  const b = yield* Effect.succeed(1);
  return a + b;
});
