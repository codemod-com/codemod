"use client";
import type { HighlightedCode } from "codehike/code";
import { Pre } from "codehike/code";
import { className } from "./classname";
import { tokenTransitions } from "./token-transitions";

export function CodeSwitcher({ info }: { info: HighlightedCode }) {
  return <CodeClient highlighted={info} />;
}

export function CodeClient(props: { highlighted: HighlightedCode }) {
  const { highlighted } = props;

  return (
    <div className="relative h-full">
      <code className="absolute right-2 top-1 z-10 code rounded-[4px] border border-black/10 bg-black/5 py-0 px-[4px] !text-[10px] backdrop-blur-md dark:border-white/10">
        /app/login/page.tsx
      </code>
      <Pre
        code={highlighted}
        handlers={[tokenTransitions, className]}
        className="h-full max-w-full code !text-[14px] overflow-auto bg-white/80 p-3 scrollbar dark:bg-gray-900/80"
        style={{
          whiteSpace: "pre-wrap",
          tabSize: 2, // Set tab size to 2 spaces
          MozTabSize: 2, // Add browser-specific support for Firefox
        }}
      />
    </div>
  );
}
