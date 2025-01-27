"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { getAuthUrl } from "@/app/(website)/studio/src/api/getAuthUrl";
import {
  ACCESS_TOKEN_COMMANDS,
  ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY,
} from "@/constants";
import { Dialog, DialogContent } from "@studio/components/ui/dialog";
import { SEARCH_PARAMS_KEYS } from "@studio/store/initialState";
import { useSession } from "next-auth/react";

export const TokenBuilder = () => {
  const { status } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [timeleft, setTimeleft] = useState(5);
  const [result, setResult] = useState<"fail" | "success" | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const onLoginIntentPopulated = useCallback((result: "fail" | "success") => {
    setIsOpen(true);
    setResult(result);

    intervalRef.current = setInterval(() => {
      setTimeleft((prev) => prev - 1);
    }, 1000);
  }, []);

  useEffect(() => {
    if (timeleft === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsOpen(false);
      window.close();
    }
  }, [timeleft]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSignedIn, isLoaded, onLoginIntentPopulated]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

    if (
      command === null ||
      !ACCESS_TOKEN_COMMANDS.includes(command) ||
      !isLoaded
    ) {
      return;
    }

    (async () => {
      if (command === ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY) {
        const sessionId = searchParams.get(SEARCH_PARAMS_KEYS.SESSION_ID);
        const iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

        const url = await getAuthUrl({
          sessionId,
          iv,
        });

        router.push(url);
      }
    })();

    if (command === ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY) {
      const sessionId = searchParams.get(SEARCH_PARAMS_KEYS.SESSION_ID);
      const iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

      localStorage.setItem(command, [sessionId, iv].join(","));
    } else {
      localStorage.setItem(command, new Date().getTime().toString());
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSignedIn, isLoaded, router, onLoginIntentPopulated]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-white text-gray-dark m-auto flex-col flex items-center gap-2">
        {result === "success" ? (
          <>
            <span>Login successful.</span>
            <span>You can return to the CLI now.</span>
            <span>
              This tab will close in{" "}
              <span className="text-red-500">{timeleft} seconds</span>...
            </span>
          </>
        ) : (
          <span className="text-red-500">
            Login failed. Please contact Codemod team.
          </span>
        )}
      </DialogContent>
    </Dialog>
  );
};
