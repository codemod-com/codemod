import { ExplainIcon } from "@features/FirstLoginExperience/ExplainIcon";
import type { Icon } from "@phosphor-icons/react/dist/lib/types";

export const IconButton = ({
  text,
  Icon,
  onClick,
  hint,
  href,
}: {
  hint: string;
  text: string;
  Icon: Icon;
  onClick?: VoidFunction;
  href?: string;
}) => {
  const component = (
    <div
      className="w-[50px]
           hover:text-accent-foreground rounded-md hover:bg-accent
           flex items-center justify-center cursor-pointer group mr-2 px-3"
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <ExplainIcon text={hint} Icon={Icon} />
        <strong className="text-[0.5rem]">{text}</strong>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="flex">
      {component}
    </a>
  ) : (
    component
  );
};
