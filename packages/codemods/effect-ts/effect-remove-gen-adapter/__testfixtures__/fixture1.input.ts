Effect.gen(function* (XXX) {
	let a = yield* XXX(Effect.succeed(0));
	let b = yield* XXX(Effect.succeed(1));
	let c = yield* XXX(
		[Effect.succeed(0), Effect.succeed(1)] as const,
		Effect.allWith(),
	);
	return a + b + c;
});
