import { useActionState } from "react";
import { createPortal } from "react-dom";

function StatefulForm({}) {
  const [state, formAction] = useActionState(increment, 0);

  createPortal();
  return <form></form>;
}
