import { signIn, useSession } from "next-auth/react";
import { memo, useEffect } from "react";

export const SignIn = memo(
  ({ forceRedirectUrl }: { forceRedirectUrl?: string }) => {
    const { status } = useSession();

    useEffect(() => {
      if (status === "authenticated") {
        window.location.href = "/";
      } else if (status === "unauthenticated") {
        signIn(undefined, { callbackUrl: forceRedirectUrl });
      }
    }, [status, forceRedirectUrl]);

    return null;
  },
);
