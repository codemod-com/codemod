import { useFlags } from 'launchdarkly-react-client-sdk';

let App = () => {
	let { flag } = useFlags();

	return <>{flag}</>;
};
