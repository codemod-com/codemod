let chancancode = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

chancancode.get('fullName');

let model = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

model.get('fullName');

let route = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

route.get('fullName');

let controller = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

controller.get('fullName');
controller.get('foo.bar');
controller.get('foo-bar');