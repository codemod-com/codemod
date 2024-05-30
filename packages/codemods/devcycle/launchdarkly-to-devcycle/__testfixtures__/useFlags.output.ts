import { useDevCycleClient } from "@devcycle/react-client-sdk";

const App = () => {
    const { flag } = useDevCycleClient().allVariables();

    return <>{flag.value}</>;
};