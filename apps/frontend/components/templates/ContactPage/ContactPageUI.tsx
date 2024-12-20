"use client";
import { useTranslation } from "react-i18next";


import Button from "@/components/shared/Button";
import Checkbox from "@/components/shared/Checkbox";
import GradientBorderBox from "@/components/shared/GradientBorderBox";
import Input from "@/components/shared/Input";
import LinkButton from "@/components/shared/LinkButton";
import Section from "@/components/shared/Section";
import { CONTACT_ENDPOINT, useFormSubmission } from "@/hooks/useFormSubmission";
import type { ContactPagePayload } from "@/types";
import { vercelStegaSplit } from "@vercel/stega";

export interface ContactPageProps {
  data: ContactPagePayload | null;
}

export default function ContactPageUI({ data }: ContactPageProps) {
const { t } = useTranslation("../components/templates/ContactPage");

  const { formState, handleSubmit, formRef } = useFormSubmission();
  const getSides = () => {
    return {
      right: false,
      left: true,
      bottom: false,
      top: false,
    };
  };

  const getMobileSides = () => {
    return {
      right: false,
      left: false,
      bottom: false,
      top: true,
    };
  };

  const dots = { tr: false, br: false, bl: false, tl: false };

  return (
    <Section className="flex w-full flex-col pb-10 pt-[calc(var(--header-height)+5rem)] lg:flex-row lg:justify-center lg:pb-20">
      <div className="flex max-w-[475px] flex-col gap-m lg:pr-2xl">
        <div className="xl-heading font-bold">{data?.title}</div>
        <div className="body-l">{data?.description}</div>
      </div>
      {formState !== "success" ? (
        <>
          <GradientBorderBox
            className="hidden w-full max-w-none flex-1 lg:flex lg:px-2xl lg:py-xl"
            sides={getSides()}
            dots={dots}
          >
            <form
              className="w-full"
              ref={formRef}
              onSubmit={handleSubmit}
              action={CONTACT_ENDPOINT}
            >
              <input name="honeypot" placeholder={t('honeypot')} type="hidden" />
              <div className="">
                <Input
                  name="name"
                  label={data?.formFields?.name}
                  placeholder={data?.formFields?.namePlaceholder}
                  required
                />
              </div>
              <div className="mt-6">
                <Input
                  name="email"
                  label={data?.formFields?.email}
                  placeholder={data?.formFields?.emailPlaceholder}
                  required
                  type="email"
                />
              </div>
              <div className="mt-6">
                <Input
                  name="company"
                  label={data?.formFields?.company}
                  placeholder={data?.formFields?.companyPlaceholder}
                  required
                />
              </div>
              <div className="mt-6">
                <Input
                  name="message"
                  isTextArea
                  label={data?.formFields?.message}
                  placeholder={data?.formFields?.messagePlaceholder}
                />
              </div>
              <div className="mt-6">
                {data?.formFields?.privacyLink && (
                  <Checkbox required className="text-primary">
                    <span className="">
                      {data?.formFields?.privacy}{" "}
                      <a
                        href={
                          vercelStegaSplit(data?.formFields?.privacyLink || "")
                            .cleaned
                        }
                        className="underline"
                      >
                        {data?.formFields?.privacyLabel}.
                      </a>
                    </span>
                  </Checkbox>
                )}
              </div>
              <Button
                intent="primary"
                className="mt-8"
                arrow
                type="submit"
                disabled={formState === "loading"}
                loading={formState === "loading"}
              >
                <span>{data?.formFields?.submit}</span>
              </Button>
              {formState === "error" ? (
                <div className="mt-8 flex items-center gap-xs rounded-[8px] bg-errorSecondary-light p-xs dark:bg-errorSecondary-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/error-info.svg" alt={t('warning-info-icon')} />
                  <span className="body-s text-error-light dark:text-error-dark">{t('system-error-message-1')}</span>
                </div>
              ) : null}
            </form>
          </GradientBorderBox>
          <GradientBorderBox
            className="mt-xl max-w-none flex-1 py-xl lg:hidden"
            sides={getMobileSides()}
            dots={dots}
          >
            <form
              className="w-full"
              ref={formRef}
              onSubmit={handleSubmit}
              action={CONTACT_ENDPOINT}
            >
              <div className="">
                <Input
                  name="name"
                  label={data?.formFields?.name}
                  placeholder={data?.formFields?.namePlaceholder}
                  required
                />
              </div>
              <div className="mt-6">
                <Input
                  name="email"
                  label={data?.formFields?.email}
                  placeholder={data?.formFields?.emailPlaceholder}
                  required
                  type="email"
                />
              </div>
              <div className="mt-6">
                <Input
                  name="company"
                  label={data?.formFields?.company}
                  placeholder={data?.formFields?.companyPlaceholder}
                  required
                />
              </div>
              <div className="mt-6">
                <Input
                  name="message"
                  isTextArea
                  label={data?.formFields?.message}
                  placeholder={data?.formFields?.messagePlaceholder}
                />
              </div>
              <div className="mt-6">
                <Checkbox required className="text-primary">
                  <span className="">
                    {data?.formFields?.privacy}{" "}
                    <a
                      href={
                        vercelStegaSplit(data?.formFields?.privacyLink || "")
                          .cleaned
                      }
                      className="underline"
                    >
                      {data?.formFields?.privacyLabel}.
                    </a>
                  </span>
                </Checkbox>
              </div>
              <Button
                intent="primary"
                className="mt-8"
                arrow
                type="submit"
                disabled={formState === "loading"}
                loading={formState === "loading"}
              >
                <span>{data?.formFields?.submit}</span>
              </Button>
              {formState === "error" ? (
                <div className="mt-8 flex items-center gap-xs rounded-[8px] bg-errorSecondary-light p-xs dark:bg-errorSecondary-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/error-info.svg" alt={t('warning-info-icon-duplicate')} />
                  <span className="body-s text-error-light dark:text-error-dark">{t('system-error-message-2')}</span>
                </div>
              ) : null}
            </form>
          </GradientBorderBox>
        </>
      ) : null}

      {formState === "success" ? (
        <>
          <GradientBorderBox
            className="mt-xl max-w-none flex-1 py-xl lg:hidden"
            sides={getMobileSides()}
            dots={dots}
          >
            <div className="l-heading mb-s font-bold">{t('thanks-for-contacting-us-1')}</div>
            <div className="body-l">{t('we-will-get-back-to-you-soon-1')}</div>
            <LinkButton intent="primary" className="mt-l" arrow href="/">
              <span>{t('go-back-home-1')}</span>
            </LinkButton>
          </GradientBorderBox>

          <GradientBorderBox
            sides={getSides()}
            dots={dots}
            className="mt-xl hidden min-h-[600px] items-start lg:mt-0 lg:flex lg:flex-col lg:pl-2xl"
          >
            <div className="l-heading mb-s font-bold">{t('thanks-for-contacting-us-2')}</div>
            <div className="body-l">{t('we-will-get-back-to-you-soon-2')}</div>
            <LinkButton intent="primary" className="mt-l" arrow href="/">
              <span>{t('go-back-home-2')}</span>
            </LinkButton>
          </GradientBorderBox>
        </>
      ) : null}
    </Section>
  );
}
