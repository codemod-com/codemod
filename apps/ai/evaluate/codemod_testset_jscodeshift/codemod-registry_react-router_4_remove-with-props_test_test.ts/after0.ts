import withProps from 'recompose/withProps';
import Dashboard from './Dashboard';

const MyApp = ({ title }) => {
    return (
        <Router history= { history } >
        <Route
						path="/"
    render = {(props) => {
    return <Dashboard title={ title } {...props } />;
}}
/>
    < /Router>
			);
		};