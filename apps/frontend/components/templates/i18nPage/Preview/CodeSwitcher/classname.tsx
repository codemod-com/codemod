import type { AnnotationHandler } from "codehike/code";

export const className: AnnotationHandler = {
  name: "className",
  Block: ({ annotation, children }) => {
    return <div className={annotation.query}>{children}</div>;
  },
  Inline: ({ annotation, children }) => {
    return <span className={annotation.query}>{children}</span>;
  },
};
