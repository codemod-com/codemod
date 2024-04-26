import { Route, Router, Switch } from 'react-router-dom';

const MyApp = () => (
    <Router history= { history } >
    <Switch>
    <Route exact path = "/posts" component = { PostList } />
        <Route exact path = "/posts/:id" component = { PostEdit } />
            <Route exact path = "/posts/:id/show" component = { PostShow } />
                <Route exact path = "/posts/:id/delete" component = { PostDelete } />
                    </Switch>
                    < /Router>
		);