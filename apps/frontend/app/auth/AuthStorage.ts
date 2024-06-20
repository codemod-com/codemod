import { withSession } from "@clerk/nextjs";
import { useEffect } from "react";

let TOKEN_STORAGE_KEY = "token";

type AuthStoreProps = {
  session: {
    getToken: () => Promise<string | null>;
  };
};

let AuthStore = ({ session }: AuthStoreProps) => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let fn = async () => {
      let token = await session.getToken();
      token && localStorage.setItem(TOKEN_STORAGE_KEY, token);
      !token && localStorage.removeItem(TOKEN_STORAGE_KEY);
    };

    fn();
  }, [session, session.getToken]);

  return null;
};

export default withSession(AuthStore);
