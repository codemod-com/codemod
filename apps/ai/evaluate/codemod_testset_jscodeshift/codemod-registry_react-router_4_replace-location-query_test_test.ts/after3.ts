import { parse } from 'query-string';
const List = ({ location }) => (
    <div>
    <h1>{ parse(location.search).sort } < /h1>
    < h1 > { parse(location.search).name } < /h1>
    < h1 > { parse(location.search).id } < /h1>
    < /div>
);