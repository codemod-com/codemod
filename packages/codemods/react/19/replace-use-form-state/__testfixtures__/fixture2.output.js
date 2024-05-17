import ReactDOM from 'react-dom';

function StatefulForm({}) {
	let [state, formAction] = ReactDOM.useActionState(increment, 0);
	return <form></form>;
}
