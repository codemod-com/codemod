
import { useActionState } from "react";

function StatefulForm({}) {
  const [state, formAction] = useActionState(increment, 0);
  return <form></form>;
}