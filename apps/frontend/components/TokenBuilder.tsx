"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  ACCESS_TOKEN_COMMANDS,
  ACCESS_TOKEN_REQUESTED_BY_CLI_STORAGE_KEY,
  TWO_MINS_IN_MS,
} from "@/constants";
import { useAuth, useUser } from "@clerk/nextjs";
import { populateLoginIntent } from "@studio/api/populateLoginIntent";
import { SEARCH_PARAMS_KEYS } from "@studio/store/getInitialState";

export const TokenBuilder = () => {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

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
        await populateLoginIntent({
          clerkToken,
          sessionId,
          iv,
        });
      }
      ACCESS_TOKEN_COMMANDS.forEach((key) => localStorage.removeItem(key));
    })();
  }, [isSignedIn, isLoaded, getToken]);

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
          await populateLoginIntent({
            clerkToken,
            sessionId,
            iv,
          });
          return;
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
  }, [getToken, isSignedIn, isLoaded, router]);

  return null;
};
