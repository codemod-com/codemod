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