import { parse } from 'query-string';
const List = ({ location }) => (
    <div>
    <h1>{ parse(location.search).sort } < /h1>
    < /div>
);