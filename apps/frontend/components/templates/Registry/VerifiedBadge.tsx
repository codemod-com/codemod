import { cx } from "cva";
import Icon from "../../shared/Icon";
import Tag from "../../shared/Tag";

export default function VerifiedBadge({
  className,
  content,
}: {
  className?: string;
  content?: string;
}) {
  return (
    <div
      className={cx(
        "group relative border-none transition-colors duration-300 hover:bg-success-light/15",
        className,
      )}
    >
      <Tag intent="default" iconOnly>
        <div className="relative">
          <Icon
            name="shield-check"
            className="text-success-light transition-all duration-300 group-hover:opacity-0 dark:text-success-dark"
          />
          <Icon
            name="shield-check-solid"
            className="absolute left-0 top-0 text-success-light opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-success-dark"
          />
        </div>
        {content && (
          <div
            className={cx(
              "absolute bottom-full left-0 z-10 w-56 cursor-default rounded-md border bg-white p-2 text-left shadow-xl transition-all duration-300 2xl:-left-24 dark:border-border-dark dark:border-opacity-40 dark:bg-background-dark",

              "pointer-events-none invisible translate-y-0 opacity-0",
              "group-hover:pointer-events-auto group-hover:visible group-hover:-translate-y-2 group-hover:opacity-100",
            )}
          >
            <h5 className="body-s-medium pb-1 font-medium">
              Codemod.com verified
            </h5>
            <p className="body-s font-regular">{content}</p>
          </div>
        )}
      </Tag>
    </div>
  );
}
