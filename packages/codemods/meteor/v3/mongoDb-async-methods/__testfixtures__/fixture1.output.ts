const docs = await MyCollection.find({ _id: '123' }).fetchAsync();
const doc = await MyCollection.findOneAsync({ _id: '123' });