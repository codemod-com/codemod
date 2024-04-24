import { Router, browserHistory } from 'react-router';
const MyApp = () => (
    <Router history= { browserHistory } >
    <Route path="/home" component = { Home } />
        </Router>
		);