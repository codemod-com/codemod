import { useSession } from "next-auth/react";
import { type ReactNode, memo } from "react";

export const SignedOut = memo(({ children }: { children?: ReactNode }) => {
  const { status } = useSession();

  return status === "unauthenticated" ? <>{children}</> : null;
});
