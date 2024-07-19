"use client";

import Button from "@/components/shared/Button";
import Checkbox from "@/components/shared/Checkbox";
import Input from "@/components/shared/Input";
import LinkButton from "@/components/shared/LinkButton";
import {
  APPLY_TO_JOB_ENDPOINT,
  useFormSubmission,
} from "@/hooks/useFormSubmission";

export default function ApplyToJobForm({
  jobTitle,
  privacyPolicy,
}: {
  jobTitle: string;
  privacyPolicy?: { label?: string; href?: string };
}) {
  const { formState, handleSubmit, formRef } = useFormSubmission();

  switch (formState) {
    case "idle":
    case "loading":
      return (
        <form
          className="w-full py-m lg:py-0"
          ref={formRef}
          onSubmit={handleSubmit}
          action={APPLY_TO_JOB_ENDPOINT}
        >
          <div>
            <Input name="name" label="Name" placeholder="Name" required />
          </div>
          <div className="mt-6">
            <Input
              name="email"
              label="Email"
              placeholder="Placeholder"
              required
              type="email"
            />
          </div>

          <div className="mt-6">
            <Input
              name="message"
              isTextArea
              label="Message"
              placeholder="Your message"
              required
            />
          </div>
          <div className="mt-6">
            {privacyPolicy?.href && (
              <Checkbox required className="text-primary">
                <span className="body-s">
                  By submitting, you agree to our{" "}
                  <a href={privacyPolicy?.href} className="underline">
                    {privacyPolicy?.label || "Privacy Policy"}
                  </a>
                </span>
              </Checkbox>
            )}
          </div>
          <div className="hidden">
            <Input
              name="job_title"
              label="Job title"
              placeholder="Job title"
              required
              value={jobTitle}
            />
          </div>
          <Button
            intent="primary"
            className="mt-8"
            arrow
            type="submit"
            disabled={formState === "loading"}
            loading={formState === "loading"}
          >
            <span>Submit</span>
          </Button>
        </form>
      );

    case "success":
      return (
        <div className="flex flex-col items-start gap-m">
          <h3 className="s-heading">Thank you!</h3>
          <p className="body-m">
            We have received your application and will get back to you as soon
            as possible.
          </p>
        </div>
      );

    case "error":
      return (
        <div className="flex flex-col items-start gap-m">
          <h3 className="s-heading">Something went wrong!</h3>

          <LinkButton href="/careers" intent="primary" arrow>
            Try again
          </LinkButton>
        </div>
      );

    default:
      return null;
  }
}
