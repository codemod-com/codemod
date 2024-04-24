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