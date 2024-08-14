import { useAuth } from "@auth/useAuth";
import { SignInButton } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@studio/components/ui/alert-dialog";
import { Button } from "@studio/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const LEARN_KEY = "learn";

export const LoginWarningModal = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const isFromCLI = useSearchParams().get("command") === LEARN_KEY;
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    setIsOpen(isFromCLI && isLoaded && !isSignedIn);
  }, [isFromCLI, isSignedIn, isLoaded]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Unlock AI&apos;s full potential</AlertDialogTitle>
        </AlertDialogHeader>

        <p>
          Sign in to Codemod & let AI automatically create your codemod.
          Alternatively, proceed to Codemod Studio & create your codemod with
          non-AI tools.
        </p>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary">Proceed without AI</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <SignInButton className="text-white flex gap-1 rounded-md text-sm my-0 h-10 !py-0 bg-black hover:bg-accent hover:text-black">
              <Button variant="primary">Sign in</Button>
            </SignInButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
