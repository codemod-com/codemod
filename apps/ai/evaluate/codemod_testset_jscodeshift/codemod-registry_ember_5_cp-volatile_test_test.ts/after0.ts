const Person = EmberObject.extend({
    get fullName() {
        return `\${this.firstName} \${this.lastName}`;
    }
});