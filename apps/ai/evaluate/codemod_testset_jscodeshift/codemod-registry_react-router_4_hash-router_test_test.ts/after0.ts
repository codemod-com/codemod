import { Router, hashHistory } from 'react-router';
import { HashRouter } from 'react-router-dom';
const MyApp = () => (
    <HashRouter>
    <Route path= "/posts" component = { PostList } />
        <Route path="/posts/:id" component = { PostEdit } />
            <Route path="/posts/:id/show" component = { PostShow } />
                <Route path="/posts/:id/delete" component = { PostDelete } />
                    </HashRouter>
		);