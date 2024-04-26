import createHistory from 'history/createBrowserHistory';

const history = createHistory();

history.block(({ location }) => {
    console.log(location);
});