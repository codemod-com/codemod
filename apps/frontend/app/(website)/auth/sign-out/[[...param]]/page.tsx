"use client";

import "@/styles/customizeClerkComponents.css";
import { SignUp } from "@clerk/nextjs";

function SignUpPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignUp />
    </div>
  );
}

export default SignUpPage;
