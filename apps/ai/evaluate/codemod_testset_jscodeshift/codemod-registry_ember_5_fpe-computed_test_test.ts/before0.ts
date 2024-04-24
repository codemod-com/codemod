import EmberObject from '@ember/object';

let Person = EmberObject.extend({
    init() {
        this._super(...arguments);

        this.firstName = 'Betty';
        this.lastName = 'Jones';
    },

    fullName: function() {
        return `\${this.firstName} \${this.lastName}`;
    }.property('firstName', 'lastName')
});

let client = Person.create();

client.get('fullName'); // 'Betty Jones'

client.set('lastName', 'Fuller');
client.get('fullName'); // 'Betty Fuller'