import { useTranslation } from "react-i18next";
import { ArrowDown as ArrowDownIcon } from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";

type CollapsableProps = {
  defaultCollapsed: boolean;
  title: ReactNode;
  rightContent: ReactNode;
  children: ReactNode;
  className?: string;
  contentWrapperClassName?: string;
};

const Collapsable = ({
  title,
  rightContent,
  children,
  defaultCollapsed,
  className,
  contentWrapperClassName,
}: CollapsableProps) => {
const { t } = useTranslation("../(website)/studio/src/components/Collapsable");

  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false);

  return (
    <div
      className={`w-full ${
        className ?? ""
      } rounded border border-gray-bg p-2 dark:border-gray-dark `}
    >
      <div
        className="flex w-full cursor-pointer items-center justify-between"
        onClick={() => setCollapsed(!collapsed)}
      >
        {title}
        <div className=" flex items-center justify-end">
          {rightContent}
          <ArrowDownIcon
            className={`h-4 w-4 transition-all ${
              collapsed ? "rotate-180 transform" : ""
            } dark:text-white `}
            alt={t('arrow-down')}
          />
        </div>
      </div>
      <div
        className={`${collapsed ? " hidden " : " block "} ${
          contentWrapperClassName ?? ""
        } mt-2 px-3`}
      >
        {children}
      </div>
    </div>
  );
};

export default Collapsable;
