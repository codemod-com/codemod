"use client";
import { useTranslation, Trans } from "react-i18next";


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
const { t } = useTranslation("../../components/shared");

  const { formState, handleSubmit, formRef } = useFormSubmission();

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
          <input name="honeypot" placeholder={t('honeypot')} type="hidden" />

          <Input
            name="email"
            className={cx(
              "w-full",
              formState === "error"
                ? "border-error-light dark:border-error-dark"
                : "",
            )}
            placeholder={t('your-email')}
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
          >{t('submit')}</Button>
        </form>
        {formState === "error" ? (
          <span className="body-s text-error-light dark:text-error-dark">{t('system-error-message')}</span>
        ) : null}
        {props.privacyLink?.link && (
          <span className="body-xs text-secondary-light dark:text-secondary-dark"><Trans
i18nKey="submission-acknowledgment-privacy-policy"
values={{ _props_privacyLink_label_Privacy_Policy_: <>
              {props.privacyLink?.label || "Privacy Policy"}</> }}
components={{"0": 
            <Link
              href={props.privacyLink?.link}
              className="underline underline-offset-2"
             />}}
/>
          </span>
        )}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-start py-[80px] lg:px-[52px] lg:pt-[140px]">
      <h2 className="m-heading text-balance">{t('subscription-confirmation')}</h2>
      <div className="mt-s">
        <span className="body-l">{t('stay-in-the-loop-message')}</span>
      </div>
    </div>
  );
}
