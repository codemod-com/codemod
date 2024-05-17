import type { useCodemodExecution } from "@studio/hooks/useCodemodExecution";
import { useEffect } from "react";
import toast from "react-hot-toast";
import type { useExecutionStatus } from "../../../hooks/useExecutionStatus";

const baseToastOptions: Parameters<typeof toast>[1] = {
  position: "top-center",
  duration: 12000,
};

export const useCodemodStatusToast = (
  codemodRunStatus: ReturnType<typeof useExecutionStatus>,
) => {
  useEffect(() => {
    const { result } = codemodRunStatus ?? {};
    if (!result) return;

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
            className="font-bold underline text-blue-600"
          >
            here
          </a>
        </span>
      ) : (
        <span>Codemod did not result in any changes.</span>
      );

      toast[result.link ? "success" : "error"](message, baseToastOptions);
    }
  }, [codemodRunStatus?.result]);
};
