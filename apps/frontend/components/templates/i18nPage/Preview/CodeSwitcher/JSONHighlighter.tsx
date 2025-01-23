"use client";

import { type HighlightedCode, Pre } from "codehike/code";
import type React from "react";
import { memo } from "react";
import { Steps } from "../types";
import { tokenTransitions } from "./token-transitions";

interface JsonHighlighterProps {
  step: number;
  code: HighlightedCode | null;
}

const JsonHighlighter: React.FC<JsonHighlighterProps> = ({ step, code }) => {
  if (!code) {
    return <div className="p-4 text-sm text-gray-500">No code available</div>;
  }

  return (
    <div className="relative h-full">
      {/* File Path Label */}
      <code className="absolute right-2 top-1 z-10 code rounded-[4px] border border-black/10 bg-black/5 py-0 px-[4px] !text-[10px] backdrop-blur-md dark:border-white/10">
        /app/locales/{step > Steps.Translating ? "es-ES" : "en-US"}.json
      </code>
      {/* JSON Code Viewer */}
      <Pre
        code={code}
        handlers={[tokenTransitions]}
        className="h-full code max-w-full flex-1 overflow-auto bg-white/80 p-3 !text-[14px] scrollbar dark:bg-gray-900/80"
        style={{
          whiteSpace: "pre-wrap",
          tabSize: 2,
          MozTabSize: 2, // Firefox-specific tab size
        }}
      />
    </div>
  );
};

export default memo(JsonHighlighter);
