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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      publishableKey={clerkPubKey as string}
    >
      {children}
    </ClerkProvider>
  );
};
export default AuthProvider;
