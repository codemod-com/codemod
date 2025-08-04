"use client";

import React, { useRef, useEffect } from "react";
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
  const { formState, handleSubmit, formRef, errorMessage } = useFormSubmission({
    recaptcha: true,
  });

  const badgeContainerRef = useRef<HTMLDivElement>(null);

  // Move ALL Google reCAPTCHA badges into our custom container so we can
  // control their position/design while still keeping them visible (per Google ToS)
  useEffect(() => {
    function moveBadges() {
      const badges =
        document.querySelectorAll<HTMLDivElement>(".grecaptcha-badge");
      badges.forEach((badge) => {
        if (
          badgeContainerRef.current &&
          badge.parentElement !== badgeContainerRef.current
        ) {
          badgeContainerRef.current.appendChild(badge);
          badge.style.position = "static";
          badge.style.boxShadow = "none";
          badge.style.width = "100%";
          badge.style.margin = "0";
        }
      });
    }

    // Move any badges that already exist
    moveBadges();

    // Also observe the body for any new badges injected later (Google sometimes adds more)
    const observer = new MutationObserver(() => moveBadges());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

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
        {/* reCAPTCHA badge & required disclosure */}
        <div
          ref={badgeContainerRef}
          className="mt-xs flex items-center justify-start text-secondary-light dark:text-secondary-dark body-xxs"
        >
          {/* The badge will be moved here via JS. If the badge hasn't loaded yet, we still render the required notice. */}
          <span>
            This site is protected by reCAPTCHA and the&nbsp;
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google Privacy&nbsp;Policy
            </a>
            &nbsp;and&nbsp;
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Terms&nbsp;of&nbsp;Service
            </a>
            &nbsp;apply.
          </span>
        </div>
        {formState === "error" && errorMessage ? (
          <span
            className="body-s text-error-light dark:text-error-dark"
            role="alert"
          >
            {errorMessage}
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
