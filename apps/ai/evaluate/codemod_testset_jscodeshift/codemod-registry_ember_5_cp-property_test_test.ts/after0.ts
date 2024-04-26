const Person = EmberObject.extend({
    fullName: computed('firstName', 'lastName', function() {
        return `\${this.firstName} \${this.lastName}`;
    })
});