import { useDevCycleClient } from '@devcycle/react-client-sdk';

let App = () => {
	let { flag } = useDevCycleClient().allVariables();

	return <>{flag.value}</>;
};
