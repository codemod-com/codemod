import type { useCodemodExecution } from "@studio/hooks/useCodemodExecution";
import { useEffect } from "react";
import toast from "react-hot-toast";

export const useCodemodStatusToast = (
  codemodRunStatus: ReturnType<typeof useCodemodExecution>["codemodRunStatus"],
) => {
  useEffect(() => {
    const { result } = codemodRunStatus ?? {};
    if (!result) return;

    const baseToastOptions: Parameters<typeof toast>[1] = {
      position: "top-center",
      duration: 12000,
    };

    if (result.status === "error") {
      toast(<span>{`❌ ${result.message}`}</span>, baseToastOptions);
    } else if (result.status === "done") {
      const message = result.link ? (
        <span>
          Success! Check out the changes{" "}
          <a
            href={result.link}
            target="_blank"
            rel="noreferrer"
            className="text-primary-light text-decoration-line"
          >
            here
          </a>
        </span>
      ) : (
        <span>❌ Codemod did not result in any changes.</span>
      );

      toast[result.link ? "success" : "error"](message, baseToastOptions);
    }
  }, [codemodRunStatus?.result]);
};
