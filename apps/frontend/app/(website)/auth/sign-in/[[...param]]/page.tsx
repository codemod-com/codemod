"use client";

import { SignIn } from "@/components/auth/SignIn";
import "@/styles/customizeClerkComponents.css";
import { useSearchParams } from "next/navigation";

function SignInPage() {
  const searchParams = useSearchParams();
  const isStudio = searchParams.get("variant") === "studio";

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignIn forceRedirectUrl={isStudio ? "/studio" : "/registry"} />
    </div>
  );
}

export default SignInPage;
