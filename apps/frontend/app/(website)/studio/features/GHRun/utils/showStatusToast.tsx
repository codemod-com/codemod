import type { GetExecutionStatusResponse } from "@shared/types";
import { toast } from "@studio/components/ui/use-toast";

export const showStatusToast = (
  result: GetExecutionStatusResponse["result"],
) => {
  if (!result) return;

  if (result.status === "error") {
    toast({
      title: `❌ ${result.message}`,
      variant: "destructive",
      duration: 12000,
    });
  }

  if (result.status === "done") {
    toast({
      variant: result.link ? "success" : "destructive",
      description: result.link ? (
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
      ),
      title: result.link ? "✅ Success!" : "❌ No changes",
      duration: 12000,
    });
  }
};
