import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, test } from 'vitest';
import transform from '../src/index.js';

describe('react-native v074 remove callback from PushNotificationIOS.removeEventListener', () => {
	test('common use case', async () => {
		let input = `
    PushNotificationIOS.removeEventListener('notification', () => {
      console.log('some  callback to remove');
    });  
		`;

		let output = `
    PushNotificationIOS.removeEventListener('notification');
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('js'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			output.replace(/\s/gm, ''),
		);
	});

	test('variable that stores function', async () => {
		let input = `
    const callback = () => {
      console.log('some  callback to remove');
    };
    PushNotificationIOS.removeEventListener('notification', callback);  
		`;

		let output = `
    PushNotificationIOS.removeEventListener('notification');
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('js'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			output.replace(/\s/gm, ''),
		);
	});
});
