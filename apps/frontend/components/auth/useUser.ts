import { useSession } from "next-auth/react";

export const useUser = () => {
  const { data, status } = useSession();

  return {
    user: {},
    isLoaded: status !== "loading",
    isSignedIn: status === "authenticated",
  };
};
