import { computed } from '@ember-decorators/object';
import Object from '@ember/object';

class Person extends Object {
    @computed('firstName', 'lastName')
    get fullName() {
        return `\${this.firstName} \${this.lastName}`;
    }

    invalidIdentifier() {
        return this['foo-bar'];
    }

    numericKey() {
        return this.get(42);
    }

    templatedKey() {
        return this.get(`\${'foo'}`);
    }
}