import { useSession } from "next-auth/react";
import { type ReactNode, memo } from "react";

export const SignedIn = memo(({ children }: { children?: ReactNode }) => {
  const { status } = useSession();

  return status === "authenticated" ? <>{children}</> : null;
});
