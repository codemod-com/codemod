import { useEffect } from "react";
import { useRef } from "react";
import { type FormEvent, useState } from "react";

export let CONTACT_ENDPOINT = "/api/contact-form";
export let NEWSLETTER_ENDPOINT = "/api/newsletter-form";
export let APPLY_TO_JOB_ENDPOINT = "/api/apply-to-job";

export function useFormSubmission() {
  let formRef = useRef<HTMLFormElement>(null);
  let [formState, setFormState] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  let [canSend, setCanSend] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let formData = new FormData(
      e.currentTarget || (e.target as HTMLFormElement),
    );

    if (formData.get("honeypot")) {
      return;
    }

    setFormState("loading");

    let res = await fetch(`${formRef?.current?.action}`, {
      method: "POST",
      body: new URLSearchParams(formData as any),
    });

    if (res.status === 200 || res.headers.get("location") === "/success") {
      setFormState("success");
    } else {
      setFormState("error");
    }
  }

  useEffect(() => {
    let form = formRef.current;
    function checkValidity(e: Event) {
      if (e.currentTarget instanceof HTMLFormElement) {
        setCanSend(e.currentTarget.checkValidity());
      }
    }
    form?.addEventListener("keyup", checkValidity);

    return () => {
      form?.removeEventListener("keyup", checkValidity);
    };
  }, [formRef]);

  return {
    formState,
    handleSubmit,
    formRef,
    canSend,
  };
}
