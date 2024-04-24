import createHistory from 'history/createBrowserHistory';

const history = createHistory();

history.listenBefore((location, callback) => {
    console.log(location);
    callback();
});