import { useEffect, useRef } from "react";
import { type AppServer, runServer } from "../mirage";

export const useMirageServer = (enabled: boolean) => {
  const serverRef = useRef<AppServer>();

  useEffect(() => {
    if (!enabled) {
      serverRef.current?.shutdown();
      return;
    }

    serverRef.current = runServer(process.env.NODE_ENV ?? "development");
  }, [enabled]);
};
