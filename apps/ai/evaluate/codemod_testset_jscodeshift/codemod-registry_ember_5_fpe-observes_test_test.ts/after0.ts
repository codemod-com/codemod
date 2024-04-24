import EmberObject from '@ember/object';

export default EmberObject.extend({
    valueObserver: observer('value', function() {
        // Executes whenever the "value" property changes
    })
});