import { useFlags } from 'launchdarkly-react-client-sdk';

const App = () => {
    const { flag } = useFlags();

    return <>{flag}</>
};