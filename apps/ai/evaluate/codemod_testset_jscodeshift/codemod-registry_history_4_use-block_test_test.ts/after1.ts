import createHistory from 'history/createBrowserHistory';

const history = createHistory();

history.block(({ location, action }) => {
    console.log(location);
    action();
});