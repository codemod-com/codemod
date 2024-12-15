"use client";
import { useTranslation, Trans } from "react-i18next";


import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ACCESS_TOKEN_COMMANDS,
  ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY,
  TWO_MINS_IN_MS,
} from "@/constants";
import { useAuth, useUser } from "@clerk/nextjs";
import { populateLoginIntent } from "@studio/api/populateLoginIntent";
import { Dialog, DialogContent } from "@studio/components/ui/dialog";
import { SEARCH_PARAMS_KEYS } from "@studio/store/initialState";

export const TokenBuilder = () => {
const { t } = useTranslation("../../components");

  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
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

    (async () => {
      const clerkToken = await getToken();
      if (clerkToken === null) {
        return;
      }
      const timestamp =
        ACCESS_TOKEN_COMMANDS.find((x) => localStorage.getItem(x)) ?? null;

      if (
        timestamp === null ||
        new Date().getTime() - Number.parseInt(timestamp, 10) > TWO_MINS_IN_MS
      ) {
        return;
      }

      if (localStorage.getItem(ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY)) {
        const [sessionId, iv] =
          localStorage
            .getItem(ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY)
            ?.split(",") || [];

        // Polling should pick it up
        try {
          await populateLoginIntent({
            clerkToken,
            sessionId,
            iv,
          });
          onLoginIntentPopulated("success");
        } catch (err) {
          onLoginIntentPopulated("fail");
        }
      }
      ACCESS_TOKEN_COMMANDS.forEach((key) => localStorage.removeItem(key));
    })();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSignedIn, isLoaded, getToken, onLoginIntentPopulated]);

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

    if (isSignedIn) {
      (async () => {
        const clerkToken = await getToken();
        if (clerkToken === null) {
          return;
        }
        if (command === ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY) {
          const sessionId = searchParams.get(SEARCH_PARAMS_KEYS.SESSION_ID);
          const iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

          // Polling should pick it up
          try {
            await populateLoginIntent({
              clerkToken,
              sessionId,
              iv,
            });
            onLoginIntentPopulated("success");
          } catch (err) {
            onLoginIntentPopulated("fail");
          }
        }
      })();
      return;
    }

    if (command === ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY) {
      const sessionId = searchParams.get(SEARCH_PARAMS_KEYS.SESSION_ID);
      const iv = searchParams.get(SEARCH_PARAMS_KEYS.IV);

      localStorage.setItem(command, [sessionId, iv].join(","));
    } else {
      localStorage.setItem(command, new Date().getTime().toString());
    }

    router.push("/auth/sign-in");

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [getToken, isSignedIn, isLoaded, router, onLoginIntentPopulated]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-white text-gray-dark m-auto flex-col flex items-center gap-2">
        {result === "success" ? (
          <>
            <span>{t('login-successful')}</span>
            <span>{t('return-to-cli')}</span>
            <span><Trans
i18nKey="tab-close-timer"
values={{ timeleft }}
components={{"0": 
              <span className="text-red-500" />}}
/></span>
          </>
        ) : (
          <span className="text-red-500">{t('login-failed-contact-codemod')}</span>
        )}
      </DialogContent>
    </Dialog>
  );
};
