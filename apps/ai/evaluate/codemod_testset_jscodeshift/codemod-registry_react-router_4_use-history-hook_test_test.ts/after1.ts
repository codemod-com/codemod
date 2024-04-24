import { useHistory } from 'react-router-dom';
function MyApp() {
    const browserHistory = useHistory();
    useEffect(() => {
        browserHistory.push('/');
    }, []);
    return null;
}