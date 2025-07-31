import { useEffect } from "react";
import { useRef } from "react";
import { type FormEvent, useState } from "react";

export const CONTACT_ENDPOINT = "/api/contact-form";
export const NEWSLETTER_ENDPOINT = "/api/newsletter-form";
export const APPLY_TO_JOB_ENDPOINT = "/api/apply-to-job";

export function useFormSubmission(options: { recaptcha?: boolean } = {}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [canSend, setCanSend] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Load reCAPTCHA script if needed (client-side only)
  useEffect(() => {
    if (!options.recaptcha || !siteKey) return;
    if (typeof window === "undefined") return;
    if (!document.querySelector("#recaptcha-script")) {
      const script = document.createElement("script");
      script.id = "recaptcha-script";
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [options.recaptcha, siteKey]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(
      e.currentTarget || (e.target as HTMLFormElement),
    );

    if (formData.get("honeypot")) {
      return;
    }

    // Attach reCAPTCHA token if enabled
    if (options.recaptcha && siteKey && typeof window !== "undefined") {
      const grecaptcha = (window as any).grecaptcha;
      if (grecaptcha) {
        await new Promise((resolve) => grecaptcha.ready(resolve));
        try {
          const token = await grecaptcha.execute(siteKey, {
            action: "newsletter",
          });
          formData.append("captchaToken", token);
        } catch (err) {
          console.error("Failed to execute reCAPTCHA", err);
        }
      }
    }

    setFormState("loading");

    const res = await fetch(`${formRef?.current?.action}`, {
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
    const form = formRef.current;
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
