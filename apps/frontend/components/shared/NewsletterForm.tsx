"use client";

import {
  NEWSLETTER_ENDPOINT,
  useFormSubmission,
} from "@/hooks/useFormSubmission";
import type { PageCtaDouble } from "@/types/object.types";
import { cx } from "cva";
import Link from "next/link";
import Button from "./Button";
import Input from "./Input";

export default function NewsletterForm(props: PageCtaDouble) {
  let { formState, handleSubmit, formRef } = useFormSubmission();

  return formState !== "success" ? (
    <div className="flex flex-col items-start py-[80px] lg:px-[52px] lg:pt-[140px]">
      <h2 className="m-heading text-balance">{props.rightSectionTitle}</h2>
      <div className="mt-xl flex w-full flex-col gap-m">
        <form
          className="flex w-full max-w-[425px] gap-xs"
          ref={formRef}
          onSubmit={handleSubmit}
          action={NEWSLETTER_ENDPOINT}
        >
          <input name="honeypot" placeholder="honeypot" type="hidden" />

          <Input
            name="email"
            className={cx(
              "w-full",
              formState === "error"
                ? "border-error-light dark:border-error-dark"
                : "",
            )}
            placeholder="Your email"
            type="email"
            inputMode="email"
            required
          />
          <Button
            intent="primary"
            className="w-fit"
            arrow
            disabled={formState === "loading"}
            loading={formState === "loading"}
          >
            Submit
          </Button>
        </form>
        {formState === "error" ? (
          <span className="body-s text-error-light dark:text-error-dark">
            There has been a system error. Please, send your form again.
          </span>
        ) : null}
        {props.privacyLink?.link && (
          <span className="body-xs text-secondary-light dark:text-secondary-dark">
            By submitting, you acknowledge codemod&apos;s{" "}
            <Link
              href={props.privacyLink?.link}
              className="underline underline-offset-2"
            >
              {props.privacyLink?.label || "Privacy Policy"}
            </Link>
          </span>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-start py-[80px] lg:px-[52px] lg:pt-[140px]">
      <h2 className="m-heading text-balance">Thanks! You&apos;re subscribed</h2>
      <div className="mt-s">
        <span className="body-l">
          Get ready to stay in the loop with all the latest updates, news, and
          exciting announcements straight to your inbox
        </span>
      </div>
    </div>
  );
}
