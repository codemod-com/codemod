import Controller from '@ember/controller';
import fetch from 'fetch';

export default Controller.extend({
    store: service('store'),

    actions: {
        sendPayload() {
            fetch('/endpoint', {
                method: 'POST',
                body: JSON.stringify({
                    route: this.currentRouteName
                })
            });
        }
    }
})