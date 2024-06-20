Effect.gen(function* () {
	let a = yield* Effect.succeed(0);
	let b = yield* Effect.succeed(1);
	let c = yield* pipe(
		[Effect.succeed(0), Effect.succeed(1)] as const,
		Effect.allWith(),
	);
	return a + b + c;
});
