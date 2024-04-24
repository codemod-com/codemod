import createHistory from 'history/createBrowserHistory';

const history = createHistory();

history.listenBefore(location => {
    console.log(location);
});