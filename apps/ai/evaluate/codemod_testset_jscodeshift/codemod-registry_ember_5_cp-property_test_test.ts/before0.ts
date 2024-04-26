const Person = EmberObject.extend({
    fullName: computed(function() {
        return `\${this.firstName} \${this.lastName}`;
    }).property('firstName', 'lastName')
});