import { Router, hashHistory } from 'react-router';

const MyApp = () => (
    <Router history= { hashHistory } >
    <Route path="/posts" component = { PostList } />
        </Router>
		);