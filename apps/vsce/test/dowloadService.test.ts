import { AxiosError, type AxiosInstance } from 'axios';
import nock from 'nock';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { FileSystem } from 'vscode';
import { retryingClient as axiosInstance } from '../src/axios';
import { DownloadService } from '../src/components/downloadService';

let mockedFileSystemUtilities = {
	getModificationTime: vi.fn(() => 1),
	setChmod: vi.fn(),
};

let fs = {
	writeFile: vi.fn(),
	stat: vi.fn(() => ({ mtime: Date.now() })),
} as unknown as FileSystem;

let downloadService = new DownloadService(
	fs,
	// @ts-expect-error not assignable to FileSystemUtilities
	mockedFileSystemUtilities,
);

let NETWORK_ERROR = new AxiosError('Some connection error');
NETWORK_ERROR.code = 'ECONNRESET';

// 3 failed responses, then good response
let responses = [
	() => nock('https://test.com').head('/test').replyWithError(NETWORK_ERROR),
	() => nock('https://test.com').head('/test').replyWithError(NETWORK_ERROR),
	() => nock('https://test.com').head('/test').replyWithError(NETWORK_ERROR),
	() =>
		nock('https://test.com')
			.head('/test')
			.reply(200, '', { 'last-modified': new Date(2).toISOString() }),
	() => nock('https://test.com').get('/test').replyWithError(NETWORK_ERROR),
	() => nock('https://test.com').get('/test').replyWithError(NETWORK_ERROR),
	() => nock('https://test.com').get('/test').replyWithError(NETWORK_ERROR),
	() => nock('https://test.com').get('/test').reply(200, 'Test'),
];

let setupResponses = (client: AxiosInstance, responses: Array<() => void>) => {
	let configureResponse = () => {
		let response = responses.shift();
		if (response) {
			response();
		}
	};

	client.interceptors.request.use(
		(config) => {
			configureResponse();
			return config;
		},
		(error) => {
			configureResponse();
			return Promise.reject(error);
		},
	);
};

describe('DownloadService', () => {
	afterEach(() => {
		nock.cleanAll();
		nock.enableNetConnect();
	});

	test('Should retry 3 times if request fails', async () => {
		setupResponses(axiosInstance, responses);

		await downloadService.downloadFileIfNeeded(
			'https://test.com/test',
			// @ts-expect-error passing a string instead of URI, because URI cannot be imported from vscode
			'/',
			'755',
		);

		expect(fs.writeFile).toBeCalledWith(
			'/',
			new Uint8Array([84, 101, 115, 116]),
		);
	});
});
