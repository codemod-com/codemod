import { getSession } from "next-auth/react";

export const getToken = () =>
  getSession()
    .then((session) => {
      // @ts-expect-error
      return session?.user?.token as string;
    })
    .catch(() => null);
