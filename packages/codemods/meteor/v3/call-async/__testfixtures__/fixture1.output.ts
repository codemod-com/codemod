import { Meteor } from 'meteor/meteor';

Meteor.methods({
  async getAllData() {
    return await MyCollection.find().fetchAsync();
  },
  async otherMethod() {
    return await MyCollection.find().fetchAsync();
  },
});

await Meteor.callAsync('getAllData');
await Meteor.callAsync('otherMethod');