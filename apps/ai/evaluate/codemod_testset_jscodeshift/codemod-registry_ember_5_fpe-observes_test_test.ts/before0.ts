import EmberObject from '@ember/object';

export default EmberObject.extend({
    valueObserver: function() {
        // Executes whenever the "value" property changes
    }.observes('value')
});