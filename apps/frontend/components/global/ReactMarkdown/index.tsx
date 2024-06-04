import CodeBlock from "@/components/templates/CodemodPage/parts/Code";
import { cx } from "cva";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type Props = {
  children: string;
};

const Markdown = ({ children }: Props) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeSanitize]}
    components={{
      blockquote: ({ children }) => (
        <blockquote className={cx("mt-4 border-l-2 border-black pl-6")}>
          {children}
        </blockquote>
      ),
      pre: ({ children }) => (
        <CodeBlock scrollable={false}>{children}</CodeBlock>
      ),
      strong: ({ children }) => <span className="font-bold">{children}</span>,
      code: ({ children, className }) => (
        <code className={cx("inline-code", className)} lang={className}>
          {children}
        </code>
      ),
      a: ({ children, ...props }) => (
        <a className="underline" {...props}>
          {children}
        </a>
      ),
      em: ({ children }) => <em>{children}</em>,
      ul: ({ children }) => <ul className="list-disc p-2">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal p-2">{children}</ol>,
      h1: ({ children }) => <h1 className={cx("m-heading")}>{children}</h1>,
      h2: ({ children }) => <h2 className={cx("s-heading")}>{children}</h2>,
      h3: ({ children }) => (
        <h3 className={cx("xs-heading  py-4")}>{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className={cx("body-l-medium py-4")}>{children}</h4>
      ),
      h5: ({ children }) => (
        <h4 className={cx("body-m-medium py-2")}>{children}</h4>
      ),
    }}
  >
    {children}
  </ReactMarkdown>
);

export default Markdown;
