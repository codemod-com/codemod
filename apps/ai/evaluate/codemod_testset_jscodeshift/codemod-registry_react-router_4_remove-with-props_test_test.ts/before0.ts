import withProps from 'recompose/withProps';
import Dashboard from './Dashboard';

const MyApp = ({ title }) => {
    const DashboardWithTitle = withProps(Dashboard, { title });
    return (
        <Router history= { history } >
        <Route path="/" component = { DashboardWithTitle } />
            </Router>
			);
		};