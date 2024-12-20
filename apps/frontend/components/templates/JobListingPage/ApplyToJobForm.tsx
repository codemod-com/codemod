"use client";
import { useTranslation, Trans } from "react-i18next";


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
const { t } = useTranslation("../components/templates/JobListingPage");

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
            <Input name="name" label={t('name-label')} placeholder={t('name-label-duplicate')} required />
          </div>
          <div className="mt-6">
            <Input
              name="email"
              label={t('email-label')}
              placeholder={t('placeholder-label')}
              required
              type="email"
            />
          </div>

          <div className="mt-6">
            <Input
              name="message"
              isTextArea
              label={t('message-label')}
              placeholder={t('your-message-placeholder')}
              required
            />
          </div>
          <div className="mt-6">
            {privacyPolicy?.href && (
              <Checkbox required className="text-primary">
                <span className="body-s"><Trans
i18nKey="submission-agreement-message"
values={{ _privacyPolicy_label_Privacy_Policy_: <>
                    {privacyPolicy?.label || "Privacy Policy"}</> }}
components={{"0": 
                  <a href={privacyPolicy?.href} className="underline" />}}
/>
                </span>
              </Checkbox>
            )}
          </div>
          <div className="hidden">
            <Input
              name="job_title"
              label={t('job-title-label')}
              placeholder={t('job-title-label-duplicate')}
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
            <span>{t('submit-button')}</span>
          </Button>
        </form>
      );

    case "success":
      return (
        <div className="flex flex-col items-start gap-m">
          <h3 className="s-heading">{t('thank-you-message')}</h3>
          <p className="body-m">{t('application-received-message')}</p>
        </div>
      );

    case "error":
      return (
        <div className="flex flex-col items-start gap-m">
          <h3 className="s-heading">{t('error-message')}</h3>

          <LinkButton href="/careers" intent="primary" arrow>{t('try-again-message')}</LinkButton>
        </div>
      );

    default:
      return null;
  }
}
