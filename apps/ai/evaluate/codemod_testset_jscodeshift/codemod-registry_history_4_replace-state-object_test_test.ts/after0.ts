import createHistory from 'history/createBrowserHistory';

const history = createHistory();

history.push({ pathname: '/new-path', search: 'search', hash: 'hash' }, { key: 'value' });