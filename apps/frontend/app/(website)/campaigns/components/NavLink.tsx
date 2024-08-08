import { cva, cx } from "cva";
import Link, { type LinkProps } from "next/link";

// @TODO move to global components
type Props = LinkProps & {
  children: React.ReactNode;
  intent: "default" | "active";
};

const navLinkVariant = cva(
  [
    "body-s-medium flex grow items-center gap-xs rounded-[4px] focus:outline-none px-[6px] py-[4px] font-medium text-primary-light dark:text-primary-dark",
    "transition-colors",
  ],
  {
    variants: {
      intent: {
        default: [
          "bg-primary-dark dark:bg-primary-light hover:bg-emphasis-light dark:hover:bg-emphasis-dark",
        ],
        active: [
          "bg-emphasis-light dark:bg-emphasis-dark hover:bg-border-light dark:hover:bg-border-dark",
        ],
      },
    },
    defaultVariants: {
      intent: "default",
    },
  },
);

const NavLink = ({ children, href, intent }: Props) => (
  <Link href={href} prefetch className={cx(navLinkVariant({ intent }))}>
    {children}
  </Link>
);

export default NavLink;
