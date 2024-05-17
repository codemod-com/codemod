import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react-native v0.74 remove alertAction', () => {
	it('should remove prop if it is a string', async () => {
		let input = `
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body', alertAction: 'view' });
		  `;

		let output = `
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body' });
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

	it('should remove prop if it is variable', async () => {
		let input = `
	  const alertAction = 'view';
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body', alertAction });
		  `;

		let output = `
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body' });
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

	it("shouldn't remove prop if it is variable but used somewhere else", async () => {
		let input = `
	  const alertAction = 'view';
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body', alertAction });
	  console.log(alertAction);
		  `;

		let output = `
	  const alertAction = 'view';
	  PushNotificationIOS.presentLocalNotification({ alertBody: 'body' });
	  console.log(alertAction);
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
