import { parse } from 'query-string';

function getOptions(props) {
    return { ...parse(props.location.search) };
}