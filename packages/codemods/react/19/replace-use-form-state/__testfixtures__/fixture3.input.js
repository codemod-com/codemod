import * as ReactDOM from 'react-dom';

function StatefulForm({}) {
	let [state, formAction] = ReactDOM.useFormState(increment, 0);
	return <form></form>;
}
