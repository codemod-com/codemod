import { createHash } from 'node:crypto';
import type { CodemodConfigInput } from '@codemod-com/utilities';
import supertest from 'supertest';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { runServer } from './server.js';
import * as utils from './util.js';

let TAR_SERVICE_PACK_RETURN = 'archive';

let CLERK_GET_USER_RETURN = {
	username: 'username',
	primaryEmailAddressId: '123',
	emailAddresses: [{ id: '123', emailAddress: 'john.doe@gmail.com' }],
	firstName: 'John',
	lastName: 'Doe',
};

let MOCK_TIMESTAMP = 'timestamp';

let mocks = vi.hoisted(() => {
	let S3Client = vi.fn();
	S3Client.prototype.send = vi.fn();

	let TarService = vi.fn();
	TarService.prototype.pack = vi
		.fn()
		.mockImplementation(() => TAR_SERVICE_PACK_RETURN);

	let PutObjectCommand = vi.fn();

	return {
		prisma: {
			codemodVersion: {
				deleteMany: vi.fn(),
				findMany: vi.fn(),
				findFirst: vi.fn(),
			},
			codemod: {
				upsert: vi.fn(),
				delete: vi.fn(),
				findUnique: vi.fn(),
			},
		},
		clerkClient: {
			users: {
				getUser: vi
					.fn()
					.mockImplementation(() => CLERK_GET_USER_RETURN),
				getOrganizationMembershipList: vi
					.fn()
					.mockImplementation(() => []),
			},
		},
		axios: {
			post: vi.fn().mockImplementation(() => ({})),
		},
		S3Client,
		TarService,
		PutObjectCommand,
	};
});

vi.mock('./db/prisma.js', async () => {
	return { prisma: mocks.prisma };
});

vi.mock('axios', async () => {
	return { default: mocks.axios };
});

vi.mock('@aws-sdk/client-s3', async () => {
	let actual = await vi.importActual('@aws-sdk/client-s3');

	return {
		...actual,
		S3Client: mocks.S3Client,
		PutObjectCommand: mocks.PutObjectCommand,
	};
});

vi.mock('./schemata/env.js', async () => {
	let actual = await vi.importActual('./schemata/env.js');

	return {
		...actual,
		parseEnvironment: vi.fn().mockImplementation(() => {
			return {
				PORT: '8081',
				DATABASE_URI: 'sqlite://:memory:',
				VERIFIED_PUBLISHERS: [],
				CLERK_PUBLISH_KEY: 'CLERK_PUBLISH_KEY',
				CLERK_SECRET_KEY: 'CLERK_SECRET_KEY',
				CLERK_JWT_KEY: 'CLERK_JWT_KEY',
				TASK_MANAGER_QUEUE_NAME: 'TASK_MANAGER_QUEUE_NAME',
				CODEMOD_COM_API_URL: 'https://codemod.com/api',
			};
		}),
	};
});

vi.mock('./util.js', async () => {
	let actual = await vi.importActual('./util.js');

	return {
		...actual,
		areClerkKeysSet: vi.fn().mockImplementation(() => true),
		getCustomAccessToken: () =>
			vi.fn().mockImplementation(() => 'accessToken'),
	};
});

vi.mock('./util.js', async () => {
	let actual = await vi.importActual('./util.js');

	return {
		...actual,
		areClerkKeysSet: vi.fn().mockImplementation(() => true),
		getCustomAccessToken: () =>
			vi.fn().mockImplementation(() => 'accessToken'),
	};
});

vi.mock('@clerk/fastify', async () => {
	let actual = await vi.importActual('@clerk/fastify');

	return {
		...actual,
		createClerkClient: vi.fn().mockImplementation(() => mocks.clerkClient),
	};
});

vi.mock('./services/tokenService.js', async () => {
	let actual = await vi.importActual('./services/tokenService.js');

	let TokenService = vi.fn();
	TokenService.prototype.findUserIdMetadataFromToken = vi
		.fn()
		.mockImplementation(() => 'userId');

	return { ...actual, TokenService };
});

vi.mock('@codemod-com/utilities', async () => {
	let actual = await vi.importActual('@codemod-com/utilities');

	return {
		...actual,
		TarService: mocks.TarService,
	};
});

vi.stubGlobal('fetch', vi.fn());

describe('/publish route', async () => {
	let fastify = await runServer();

	afterAll(async () => {
		await fastify.close();
	});

	afterEach(async () => {
		vi.clearAllMocks();
	});

	await fastify.ready();

	let getCustomAccessTokenSpy = vi.spyOn(utils, 'getCustomAccessToken');

	let codemodRcContents: CodemodConfigInput = {
		name: 'mycodemod',
		version: '1.0.0',
		private: false,
		applicability: {
			from: [['eslint', '>=', '12.0.0']],
		},
		engine: 'jscodeshift',
		meta: {
			tags: ['migration'],
		},
	};

	let codemodRcBuf = Buffer.from(JSON.stringify(codemodRcContents), 'utf8');
	let indexCjsBuf = Buffer.from('Code...', 'utf8');
	let readmeBuf = Buffer.from('README', 'utf8');

	it('should go through the happy path with expected result and calling expected stubs', async () => {
		mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);
		mocks.prisma.codemod.findUnique.mockImplementation(() => null);

		mocks.prisma.codemod.upsert.mockImplementation(() => {
			return { createdAt: { getTime: () => MOCK_TIMESTAMP } };
		});

		let expectedCode = 200;

		let response = await supertest(fastify.server)
			.post('/publish')
			.attach('.codemodrc.json', codemodRcBuf, {
				contentType: 'multipart/form-data',
				filename: '.codemodrc.json',
			})
			.attach('index.cjs', indexCjsBuf, {
				contentType: 'multipart/form-data',
				filename: 'index.cjs',
			})
			.attach('description.md', readmeBuf, {
				contentType: 'multipart/form-data',
				filename: 'description.md',
			})
			.expect((res) => {
				if (res.status !== expectedCode) {
					console.log(JSON.stringify(res.body, null, 2));
				}
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(expectedCode);

		expect(getCustomAccessTokenSpy).toHaveBeenCalledOnce();

		let tarServiceInstance = mocks.TarService.mock.instances[0];
		expect(tarServiceInstance.pack).toHaveBeenCalledOnce();
		expect(tarServiceInstance.pack).toHaveBeenCalledWith([
			{
				name: '.codemodrc.json',
				data: codemodRcBuf,
			},
			{
				name: 'index.cjs',
				data: indexCjsBuf,
			},
			{
				name: 'description.md',
				data: readmeBuf,
			},
		]);
		expect(tarServiceInstance.pack).toReturnWith(TAR_SERVICE_PACK_RETURN);

		let hashDigest = createHash('ripemd160')
			.update(codemodRcContents.name)
			.digest('base64url');

		let clientInstance = mocks.S3Client.mock.instances[0];
		let putObjectCommandInstance = mocks.PutObjectCommand.mock.instances[0];

		expect(putObjectCommandInstance.constructor).toHaveBeenCalledOnce();
		expect(putObjectCommandInstance.constructor).toHaveBeenCalledWith({
			Bucket: 'codemod-public',
			Key: `codemod-registry/${hashDigest}/${codemodRcContents.version}/codemod.tar.gz`,
			Body: TAR_SERVICE_PACK_RETURN,
		});

		expect(clientInstance.send).toHaveBeenCalledOnce();
		expect(clientInstance.send).toHaveBeenCalledWith(
			putObjectCommandInstance,
			{
				requestTimeout: 5000,
			},
		);

		expect(mocks.axios.post).toHaveBeenCalledOnce();
		expect(mocks.axios.post).toHaveBeenCalledWith(
			'https://hooks.zapier.com/hooks/catch/18983913/2ybuovt/',
			{
				codemod: {
					name: codemodRcContents.name,
					from: codemodRcContents.applicability?.from?.map((tuple) =>
						tuple.join(' '),
					),
					to: codemodRcContents.applicability?.to?.map((tuple) =>
						tuple.join(' '),
					),
					engine: codemodRcContents.engine,
					publishedAt: MOCK_TIMESTAMP,
				},
				author: {
					username: CLERK_GET_USER_RETURN.username,
					name: `${CLERK_GET_USER_RETURN.firstName} ${CLERK_GET_USER_RETURN.lastName}`,
					email: CLERK_GET_USER_RETURN.emailAddresses[0]
						?.emailAddress,
				},
			},
		);

		expect(response.body).toEqual({ success: true });
	});

	it('should publish piranha codemods', async () => {
		mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);

		let expectedCode = 200;

		let response = await supertest(fastify.server)
			.post('/publish')
			.attach('.codemodrc.json', codemodRcBuf, {
				contentType: 'multipart/form-data',
				filename: '.codemodrc.json',
			})
			.attach('rules.toml', indexCjsBuf, {
				contentType: 'multipart/form-data',
				filename: 'rules.toml',
			})
			.attach('description.md', readmeBuf, {
				contentType: 'multipart/form-data',
				filename: 'description.md',
			})
			.expect((res) => {
				if (res.status !== expectedCode) {
					console.log(JSON.stringify(res.body, null, 2));
				}
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(expectedCode);

		expect(getCustomAccessTokenSpy).toHaveBeenCalledOnce();

		let tarServiceInstance = mocks.TarService.mock.instances[0];
		expect(tarServiceInstance.pack).toHaveBeenCalledOnce();
		expect(tarServiceInstance.pack).toHaveBeenCalledWith([
			{
				name: '.codemodrc.json',
				data: codemodRcBuf,
			},
			{
				name: 'rules.toml',
				data: indexCjsBuf,
			},
			{
				name: 'description.md',
				data: readmeBuf,
			},
		]);
		expect(tarServiceInstance.pack).toReturnWith(TAR_SERVICE_PACK_RETURN);

		let hashDigest = createHash('ripemd160')
			.update(codemodRcContents.name)
			.digest('base64url');

		let clientInstance = mocks.S3Client.mock.instances[0];
		let putObjectCommandInstance = mocks.PutObjectCommand.mock.instances[0];

		expect(putObjectCommandInstance.constructor).toHaveBeenCalledOnce();
		expect(putObjectCommandInstance.constructor).toHaveBeenCalledWith({
			Bucket: 'codemod-public',
			Key: `codemod-registry/${hashDigest}/${codemodRcContents.version}/codemod.tar.gz`,
			Body: TAR_SERVICE_PACK_RETURN,
		});

		expect(clientInstance.send).toHaveBeenCalledOnce();
		expect(clientInstance.send).toHaveBeenCalledWith(
			putObjectCommandInstance,
			{
				requestTimeout: 5000,
			},
		);

		expect(response.body).toEqual({ success: true });
	});

	it('should not allow further execution if required files were not provided', async () => {
		mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);

		let expectedCode = 400;

		let response = await supertest(fastify.server)
			.post('/publish')
			.attach('.codemodrc.json', codemodRcBuf, {
				contentType: 'multipart/form-data',
				filename: '.codemodrc.json',
			})
			.attach('description.md', readmeBuf, {
				contentType: 'multipart/form-data',
				filename: 'description.md',
			})
			.expect((res) => {
				if (res.status !== expectedCode) {
					console.log(JSON.stringify(res.body, null, 2));
				}
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(expectedCode);

		expect(getCustomAccessTokenSpy).toHaveBeenCalledOnce();

		expect(response.body).toEqual({
			error: 'No main file was provided',
			success: false,
		});
	});

	it('when db write fails, it should fail with 500 and return the error message', async () => {
		mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);

		let errorMsg = 'Test error';
		mocks.prisma.codemod.upsert.mockImplementation(() => {
			throw new Error(errorMsg);
		});

		let expectedCode = 500;

		let response = await supertest(fastify.server)
			.post('/publish')
			.attach('.codemodrc.json', codemodRcBuf, {
				contentType: 'multipart/form-data',
				filename: '.codemodrc.json',
			})
			.attach('index.cjs', indexCjsBuf, {
				contentType: 'multipart/form-data',
				filename: 'index.cjs',
			})
			.attach('description.md', readmeBuf, {
				contentType: 'multipart/form-data',
				filename: 'description.md',
			})
			.expect((res) => {
				if (res.status !== expectedCode) {
					console.log(JSON.stringify(res.body, null, 2));
				}
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(expectedCode);

		expect(mocks.prisma.codemod.upsert).toHaveBeenCalledOnce();

		// anything related to s3 should not happen
		expect(mocks.S3Client.mock.instances.length).toEqual(0);
		expect(mocks.PutObjectCommand.mock.instances.length).toEqual(0);

		expect(response.body).toEqual({
			error: `Failed writing codemod to the database: ${errorMsg}`,
			success: false,
		});
	});

	it('should fail to publish if a codemod with provided version already exists', async () => {
		mocks.prisma.codemodVersion.findFirst.mockImplementation(() => ({
			version: '1.0.0',
		}));

		let expectedCode = 400;

		let response = await supertest(fastify.server)
			.post('/publish')
			.attach('.codemodrc.json', codemodRcBuf, {
				contentType: 'multipart/form-data',
				filename: '.codemodrc.json',
			})
			.attach('index.cjs', indexCjsBuf, {
				contentType: 'multipart/form-data',
				filename: 'index.cjs',
			})
			.attach('description.md', readmeBuf, {
				contentType: 'multipart/form-data',
				filename: 'description.md',
			})
			.expect((res) => {
				if (res.status !== expectedCode) {
					console.log(JSON.stringify(res.body, null, 2));
				}
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(expectedCode);

		expect(mocks.prisma.codemod.upsert).toHaveBeenCalledTimes(0);

		expect(response.body).toEqual({
			error: `Codemod ${codemodRcContents.name} version ${codemodRcContents.version} is lower than the latest published or the same as the latest published version: 1.0.0`,
			success: false,
		});
	});

	it('should fail to publish a codemod from a certain author if another author already took the name', async () => {
		mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);
		mocks.prisma.codemod.findUnique.mockImplementationOnce(() => ({
			version: '1.0.0',
		}));

		let expectedCode = 400;

		let response = await supertest(fastify.server)
			.post('/publish')
			.attach('.codemodrc.json', codemodRcBuf, {
				contentType: 'multipart/form-data',
				filename: '.codemodrc.json',
			})
			.attach('index.cjs', indexCjsBuf, {
				contentType: 'multipart/form-data',
				filename: 'index.cjs',
			})
			.attach('description.md', readmeBuf, {
				contentType: 'multipart/form-data',
				filename: 'description.md',
			})
			.expect((res) => {
				if (res.status !== expectedCode) {
					console.log(JSON.stringify(res.body, null, 2));
				}
			})
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(expectedCode);

		expect(mocks.prisma.codemod.upsert).toHaveBeenCalledTimes(0);

		expect(response.body).toEqual({
			error: `Codemod name \`${codemodRcContents.name}\` is already taken.`,
			success: false,
		});
	});

	describe('when s3 upload fails', async () => {
		it('should delete the appropriate version from the database if other versions exist', async () => {
			mocks.prisma.codemodVersion.findFirst.mockImplementation(
				() => null,
			);

			mocks.prisma.codemod.upsert.mockImplementation(() => {
				return {
					createdAt: { getTime: () => MOCK_TIMESTAMP },
					id: 'id',
				};
			});

			let errorMsg = 'Test error';
			mocks.S3Client.prototype.send = vi.fn().mockImplementation(() => {
				throw new Error(errorMsg);
			});

			mocks.prisma.codemodVersion.findMany = vi
				.fn()
				.mockImplementation(() => {
					return [{ version: '1.0.0' }, { version: '1.0.1' }];
				});

			let expectedCode = 500;

			let response = await supertest(fastify.server)
				.post('/publish')
				.attach('.codemodrc.json', codemodRcBuf, {
					contentType: 'multipart/form-data',
					filename: '.codemodrc.json',
				})
				.attach('index.cjs', indexCjsBuf, {
					contentType: 'multipart/form-data',
					filename: 'index.cjs',
				})
				.attach('description.md', readmeBuf, {
					contentType: 'multipart/form-data',
					filename: 'description.md',
				})
				.expect((res) => {
					if (res.status !== expectedCode) {
						console.log(JSON.stringify(res.body, null, 2));
					}
				})
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(expectedCode);

			let hashDigest = createHash('ripemd160')
				.update(codemodRcContents.name)
				.digest('base64url');

			let clientInstance = mocks.S3Client.mock.instances[0];

			expect(clientInstance.send).toHaveBeenCalledOnce();
			expect(clientInstance.send).toThrowError(errorMsg);

			expect(
				mocks.prisma.codemodVersion.deleteMany,
			).toHaveBeenCalledOnce();
			expect(mocks.prisma.codemodVersion.deleteMany).toHaveBeenCalledWith(
				{
					where: {
						codemod: {
							name: codemodRcContents.name,
						},
						version: codemodRcContents.version,
					},
				},
			);

			expect(response.body).toEqual({
				error: `Failed publishing to S3: ${errorMsg}`,
				success: false,
			});
		});

		it('should delete the appropriate version from the database AND the codemod itself if no other versions exist', async () => {
			mocks.prisma.codemod.upsert.mockImplementation(() => {
				return {
					createdAt: { getTime: () => MOCK_TIMESTAMP },
					id: 'id',
				};
			});

			let errorMsg = 'Test error';
			mocks.S3Client.prototype.send = vi.fn().mockImplementation(() => {
				throw new Error(errorMsg);
			});

			mocks.prisma.codemodVersion.findMany = vi
				.fn()
				.mockImplementation(() => {
					return [];
				});

			let expectedCode = 500;

			let response = await supertest(fastify.server)
				.post('/publish')
				.attach('.codemodrc.json', codemodRcBuf, {
					contentType: 'multipart/form-data',
					filename: '.codemodrc.json',
				})
				.attach('index.cjs', indexCjsBuf, {
					contentType: 'multipart/form-data',
					filename: 'index.cjs',
				})
				.attach('description.md', readmeBuf, {
					contentType: 'multipart/form-data',
					filename: 'description.md',
				})
				.expect((res) => {
					if (res.status !== expectedCode) {
						console.log(JSON.stringify(res.body, null, 2));
					}
				})
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(expectedCode);

			let clientInstance = mocks.S3Client.mock.instances[0];

			expect(clientInstance.send).toHaveBeenCalledOnce();
			expect(clientInstance.send).toThrowError(errorMsg);

			expect(
				mocks.prisma.codemodVersion.deleteMany,
			).toHaveBeenCalledOnce();
			expect(mocks.prisma.codemodVersion.deleteMany).toHaveBeenCalledWith(
				{
					where: {
						codemod: {
							name: codemodRcContents.name,
						},
						version: codemodRcContents.version,
					},
				},
			);

			expect(mocks.prisma.codemod.delete).toHaveBeenCalledOnce();
			expect(mocks.prisma.codemod.delete).toHaveBeenCalledWith({
				where: {
					name: codemodRcContents.name,
				},
			});

			expect(response.body).toEqual({
				error: `Failed publishing to S3: ${errorMsg}`,
				success: false,
			});
		});
	});

	describe('when publishing via org', async () => {
		it('should go through happy path if user has access to the org', async () => {
			mocks.prisma.codemodVersion.findFirst.mockImplementation(
				() => null,
			);
			mocks.clerkClient.users.getOrganizationMembershipList.mockImplementation(
				() => [{ organization: { slug: 'org' } }],
			);
			mocks.prisma.codemod.upsert.mockImplementation(() => {
				return {
					createdAt: { getTime: () => MOCK_TIMESTAMP },
					id: 'id',
				};
			});
			mocks.S3Client.prototype.send = vi
				.fn()
				.mockImplementation(() => ({}));

			mocks.prisma.codemodVersion.findMany = vi
				.fn()
				.mockImplementation(() => {
					return [];
				});

			let codemodRcContents: CodemodConfigInput = {
				name: '@org/mycodemod',
				version: '1.0.0',
				applicability: {
					from: [['eslint', '>=', '12.0.0']],
				},
				engine: 'jscodeshift',
				meta: {
					tags: ['migration'],
				},
			};

			let codemodRcBuf = Buffer.from(
				JSON.stringify(codemodRcContents),
				'utf8',
			);

			let expectedCode = 200;

			let response = await supertest(fastify.server)
				.post('/publish')
				.attach('.codemodrc.json', codemodRcBuf, {
					contentType: 'multipart/form-data',
					filename: '.codemodrc.json',
				})
				.attach('index.cjs', indexCjsBuf, {
					contentType: 'multipart/form-data',
					filename: 'index.cjs',
				})
				.attach('description.md', readmeBuf, {
					contentType: 'multipart/form-data',
					filename: 'description.md',
				})
				.expect((res) => {
					if (res.status !== expectedCode) {
						console.log(JSON.stringify(res.body, null, 2));
					}
				})
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(expectedCode);

			let clientInstance = mocks.S3Client.mock.instances[0];
			expect(clientInstance.send).toHaveBeenCalledOnce();

			expect(response.body).toEqual({
				success: true,
			});
		});

		it('should fail if user has no access to the org', async () => {
			mocks.prisma.codemodVersion.findFirst.mockImplementation(
				() => null,
			);
			mocks.clerkClient.users.getOrganizationMembershipList.mockImplementation(
				() => [],
			);

			let codemodRcContents: CodemodConfigInput = {
				name: '@org/mycodemod',
				version: '1.0.0',
				applicability: {
					from: [['eslint', '>=', '12.0.0']],
				},
				engine: 'jscodeshift',
				meta: {
					tags: ['migration'],
				},
			};

			let codemodRcBuf = Buffer.from(
				JSON.stringify(codemodRcContents),
				'utf8',
			);

			let expectedCode = 403;

			let response = await supertest(fastify.server)
				.post('/publish')
				.attach('.codemodrc.json', codemodRcBuf, {
					contentType: 'multipart/form-data',
					filename: '.codemodrc.json',
				})
				.attach('index.cjs', indexCjsBuf, {
					contentType: 'multipart/form-data',
					filename: 'index.cjs',
				})
				.attach('description.md', readmeBuf, {
					contentType: 'multipart/form-data',
					filename: 'description.md',
				})
				.expect((res) => {
					if (res.status !== expectedCode) {
						console.log(JSON.stringify(res.body, null, 2));
					}
				})
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect(expectedCode);

			expect(mocks.prisma.codemod.upsert).toHaveBeenCalledTimes(0);

			expect(response.body).toEqual({
				error: `You are not allowed to publish under namespace "org"`,
				success: false,
			});
		});
	});
});
