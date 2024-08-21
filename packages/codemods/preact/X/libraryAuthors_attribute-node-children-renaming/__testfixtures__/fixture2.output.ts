import ky from 'ky';
class HTTPError extends Error {}

const response = await ky.post('https://example.com', {
  json: { foo: true },
});

const json = await response.json();

console.log(json);
//=> `{data: '🦄'}`