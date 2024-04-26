import { browserHistory } from 'react-router-dom';
function MyApp() {
    useEffect(() => {
        browserHistory.push('/');
    }, []);
    return null;
}