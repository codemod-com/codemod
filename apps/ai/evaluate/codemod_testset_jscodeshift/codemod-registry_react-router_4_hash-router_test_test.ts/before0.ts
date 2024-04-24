import { Router, hashHistory } from 'react-router';
const MyApp = () => (
    <Router history= { hashHistory } >
    <Route path="/posts" component = { PostList } />
        <Route path="/posts/:id" component = { PostEdit } />
            <Route path="/posts/:id/show" component = { PostShow } />
                <Route path="/posts/:id/delete" component = { PostDelete } />
                    </Router>
		);