import { type Output, type ValiError, object, parse, string } from 'valibot';

export let environmentSchema = object({
	NODE_ENV: string(),
	CLERK_PUBLISH_KEY: string(),
	CLERK_SECRET_KEY: string(),
	CLERK_JWT_KEY: string(),
	REDIS_HOST: string(),
	REDIS_PORT: string(),
	TASK_MANAGER_QUEUE_NAME: string(),
});

export type Environment = Output<typeof environmentSchema>;

export let parseEnvironment = (input: unknown) => {
	try {
		return parse(environmentSchema, input);
	} catch (err) {
		throw new Error(
			`Invalid environment: ${(err as ValiError).issues
				.map((i) => i.path?.map((p) => p.key).join('.'))
				.join(', ')}`,
		);
	}
};
