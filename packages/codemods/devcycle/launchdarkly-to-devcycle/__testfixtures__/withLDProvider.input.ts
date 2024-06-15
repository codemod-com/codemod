import { withLDProvider } from 'launchdarkly-react-client-sdk';

let App = () => null;

export default withLDProvider({
	clientSideID: '',
})(App);
