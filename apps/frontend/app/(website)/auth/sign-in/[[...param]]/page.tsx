"use client";

import "@/styles/customizeClerkComponents.css";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

function SignInPage() {
  const searchParams = useSearchParams();
  const isStudio = searchParams.get("variant") === "studio";

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignIn
        fallbackRedirectUrl={isStudio ? "/studio" : "/registry"}
        appearance={{ elements: { footer: { display: "none" } } }}
      />
    </div>
  );
}

export default SignInPage;
