import { Meteor } from 'meteor/meteor';

Meteor.methods({
  async getAllData() {
    return await MyCollection.find().fetch();
  },
  async otherMethod() {
    return await MyCollection.find().fetch();
  },
});

Meteor.call('getAllData');
Meteor.call('otherMethod');