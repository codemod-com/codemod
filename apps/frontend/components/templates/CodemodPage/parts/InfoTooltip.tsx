import Icon from "@/components/shared/Icon";
import LinkButton from "@/components/shared/LinkButton";
import { RichText } from "@/components/shared/RichText";
import type { BlocksBody } from "@/types";
import { cx } from "cva";

export default function InfoTooltip({
  className,
  content,
  cta,
}: {
  className?: string;
  content?: BlocksBody;
  cta?: {
    link?: string;
    label?: string;
  };
}) {
  return (
    <div className={cx("group relative ", className)}>
      {/* <img src="/icons/info.svg" alt="Info icon" /> */}
      <Icon
        name="badge-info"
        className="cursor-pointer text-primary-light dark:text-primary-dark"
      />
      {content && (
        <div
          className={cx(
            "absolute right-0 top-[140%] !z-[9999] w-56 cursor-default rounded-md border bg-white p-2 text-left shadow-xl transition-all duration-300 2xl:left-auto 2xl:right-0 dark:border-border-dark dark:bg-background-dark",
            "pointer-events-none invisible translate-y-0 opacity-0 delay-300",
            "group-hover:pointer-events-auto group-hover:visible group-hover:-translate-y-2 group-hover:opacity-100 group-hover:delay-0",
          )}
        >
          <RichText
            value={content}
            components={{
              block: {
                normal: ({ children }) => (
                  <p className="body-s mb-2  flex  flex-col gap-2 font-regular text-primary-light dark:text-primary-dark">
                    {children}
                  </p>
                ),
              },
            }}
          />
          {cta?.link && (
            <LinkButton
              className="w-full"
              icon="book-open"
              iconPosition="left"
              intent="secondary"
              target="_blank"
              href={cta.link || "https://docs.codemod.com/introduction"}
            >
              {cta.label || "Documentation"}
            </LinkButton>
          )}
        </div>
      )}
    </div>
  );
}
