import { useActionState as UFS } from "react";
import { createPortal } from "react-dom";

function StatefulForm({}) {
  const [state, formAction] = UFS(increment, 0);

  createPortal();
  return <form></form>;
}
