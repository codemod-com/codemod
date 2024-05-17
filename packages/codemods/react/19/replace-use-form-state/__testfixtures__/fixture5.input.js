import { createPortal, useFormState } from 'react-dom';

function StatefulForm({}) {
	let [state, formAction] = useFormState(increment, 0);

	createPortal();
	return <form></form>;
}
