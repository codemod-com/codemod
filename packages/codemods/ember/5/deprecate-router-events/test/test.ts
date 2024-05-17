import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('ember 5 deprecate-router-events', () => {
	it('basic', () => {
		let INPUT = `
		import Router from '@ember/routing/router';
        import { inject as service } from '@ember/service';

        export default Router.extend({
        currentUser: service('current-user'),

        willTransition(transition) {
            this._super(...arguments);
            if (!this.currentUser.isLoggedIn) {
            transition.abort();
            this.transitionTo('login');
            }
        },

        didTransition(privateInfos) {
            this._super(...arguments);
            ga.send('pageView', {
            pageName: privateInfos.name
            });
        }
        });
		`;

		let OUTPUT = `
		import Router from '@ember/routing/router';
        import { inject as service } from '@ember/service';

        export default Router.extend({
        currentUser: service('current-user'),

        init() {
            this._super(...arguments);

            this.on("routeWillChange", transition => {
            if (!this.currentUser.isLoggedIn) {
                transition.abort();
                this.transitionTo('login');
            }
            });

            this.on("routeDidChange", transition => {
            ga.send('pageView', {
                pageName: privateInfos.name
            });
            });
        }
        });
        `;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('js'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
