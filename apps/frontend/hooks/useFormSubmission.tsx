import { useEffect } from "react";
import { useRef } from "react";
import { type FormEvent, useState } from "react";

export const CONTACT_ENDPOINT = "/api/contact-form";
export const NEWSLETTER_ENDPOINT = "/api/newsletter-form";
export const APPLY_TO_JOB_ENDPOINT = "/api/apply-to-job";

export function useFormSubmission() {
	const formRef = useRef<HTMLFormElement>(null);
	const [formState, setFormState] = useState<
		"idle" | "loading" | "error" | "success"
	>("idle");
	const [canSend, setCanSend] = useState(false);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const formData = new FormData(
			e.currentTarget || (e.target as HTMLFormElement),
		);

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
