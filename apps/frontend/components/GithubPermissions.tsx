import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent } from "@studio/components/ui/dialog";
import { useRouter } from "next/navigation";
import { type JSX, memo, useEffect, useRef, useState } from "react";

const CLOSE_PAGE_AFTER = 10000;

const messages = {
  errorGettingPermissions: (
    <span className="text-red-500">
      There was an error getting the permissions. Please try again.
    </span>
  ),
  successGettingPermissions: (
    <>
      <span>Github permissions were granted.</span>
      <span>You can return to execution of workflow now.</span>
    </>
  ),
  errorNotLoggedIn: (
    <span className="text-red-500">
      You are not logged in. Please log in to continue.
    </span>
  ),
  requestingPermissions: <span>Verifying Github permissions...</span>,
};

export const GithubPermissions = memo(() => {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  const [dialogContent, setDialogContent] = useState<JSX.Element>();

  const closeTimeout = useRef<NodeJS.Timeout>();
  const [closeAfter, setCloseAfter] = useState<number>();
  const [closeAfterSeconds, setCloseAfterSeconds] = useState<number>();
  const startClosingTimer = () => {
    setCloseAfter(Date.now() + CLOSE_PAGE_AFTER);
  };

  useEffect(() => {
    if (!closeAfter) {
      return;
    }

    const tick = () => {
      if (closeAfter <= Date.now()) {
        window.close();
        setDialogContent(undefined);
        if (!window.closed) {
          router.push(window.location.href.split("?")[0] as string);
        }
        return;
      }
      const timeLeft = Math.floor((closeAfter - Date.now()) / 1000);
      if (closeAfterSeconds !== timeLeft) {
        setCloseAfterSeconds(timeLeft);
      }
      clearTimeout(closeTimeout.current);
      closeTimeout.current = setTimeout(tick, 200);
    };

    tick();
  }, [closeAfter, closeAfterSeconds, router]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get("permissions");

    if (type === "github") {
      if (!isSignedIn) {
        setDialogContent(messages.errorNotLoggedIn);
        return;
      }

      const scopes = searchParams.getAll("scopes");
      if (!scopes.length) {
        return;
      }

      const arePermissionsRequested =
        searchParams.get("status") === "requested";

      const githubAccount = user?.externalAccounts.find(
        (account) => account.provider === "github",
      );

      if (!githubAccount) {
        return;
      }

      if (arePermissionsRequested) {
        const availableScopes = githubAccount.approvedScopes.split(" ");
        const allScopesApproved = scopes.every((scope) =>
          availableScopes.includes(scope),
        );

        if (allScopesApproved) {
          setDialogContent(messages.successGettingPermissions);
          startClosingTimer();
        } else {
          setDialogContent(messages.errorGettingPermissions);
        }
        return;
      }

      try {
        githubAccount
          .reauthorize({
            redirectUrl: `${window.location.href}&status=requested`,
            additionalScopes: scopes,
          })
          .then((res) => {
            if (res.verification?.externalVerificationRedirectURL) {
              setDialogContent(messages.requestingPermissions);
              router.push(
                res.verification.externalVerificationRedirectURL.href,
              );
              return;
            }
          })
          .catch(() => {
            setDialogContent(messages.requestingPermissions);
          });

        throw new Error("externalVerificationRedirectURL not found");
      } catch (err) {
        setDialogContent(messages.requestingPermissions);
      }
    }
  }, [isLoaded]);

  if (!dialogContent) {
    return null;
  }

  return (
    <Dialog open onOpenChange={() => setDialogContent(undefined)}>
      <DialogContent className="max-w-2xl bg-white text-gray-dark m-auto flex-col flex items-center gap-2">
        {dialogContent}
        {closeAfter && (
          <span>
            This tab will close in{" "}
            <span className="text-red-500">
              {closeAfterSeconds} second{closeAfterSeconds === 1 ? "" : "s"}
            </span>
            ...
          </span>
        )}
      </DialogContent>
    </Dialog>
  );
});

GithubPermissions.displayName = "GithubPermissions";
