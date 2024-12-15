import { I18nextProvider } from "react-i18next";
import { i18n } from "./i18n";
import { env } from "@/env";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { ReactNode } from "react";

const clerkPubKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const AuthProvider = ({ children }: { children: ReactNode }) => {
  // const { isDark } = useTheme();
  // const theme = useMemo(() => (isDark ? dark : undefined), [isDark]);
  if (!clerkPubKey) {
    throw new Error("Clerk Public Key not set");
  }

  return (
    <I18nextProvider i18n={i18n}>
<ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      publishableKey={clerkPubKey as string}
    >
      {children}
    </ClerkProvider>
</I18nextProvider>
  );
};
export default AuthProvider;
