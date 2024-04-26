import { parse } from 'query-string';
const id = parse(location.search).id;
const name = parse(location.search).name;