const history = createHashHistory();
import createHashHistory from 'history/createHashHistory';
import { Router, hashHistory } from 'react-router';

const MyApp = () => (
    <Router history= { history } >
    <Route path="/posts" component = { PostList } />
        </Router>
		);