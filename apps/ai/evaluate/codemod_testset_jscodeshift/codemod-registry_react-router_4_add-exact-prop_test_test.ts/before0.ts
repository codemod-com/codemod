import { Route, Router, Switch } from 'react-router-dom';

const MyApp = () => (
    <Router history= { history } >
    <Switch>
    <Route path="/posts" component = { PostList } />
        <Route path="/posts/:id" component = { PostEdit } />
            <Route path="/posts/:id/show" component = { PostShow } />
                <Route path="/posts/:id/delete" component = { PostDelete } />
                    </Switch>
                    < /Router>
		);