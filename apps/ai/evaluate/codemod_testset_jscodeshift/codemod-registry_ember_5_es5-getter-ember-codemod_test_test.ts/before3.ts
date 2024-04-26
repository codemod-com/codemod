class Things {
    objectLookup() {
        let chancancode = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

        chancancode.get('fullName');
    }

    modelLookup() {
        let model = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

        model.get('fullName');
    }

    routeLookup() {
        let route = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

        route.get('fullName');
    }

    controllerLookup() {
        let controller = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

        controller.get('fullName');
        controller.get('foo.bar');
        controller.get('foo-bar');
    }
}