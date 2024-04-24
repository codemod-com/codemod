import type { PrismTheme } from "prism-react-renderer";
const theme: PrismTheme = {
  plain: {
    color: "var(--text-color-code-plain)",
  },
  styles: [
    {
      types: ["prolog", "constant", "builtin"],
      style: {
        color: "#49E2FF",
      },
    },
    {
      types: ["inserted", "function"],
      style: {
        color: "rgba(229, 151, 0, 1)",
      },
    },
    {
      types: ["deleted"],
      style: {
        color: "rgb(255, 85, 85)",
      },
    },
    {
      types: ["changed"],
      style: {
        color: "rgb(255, 184, 108)",
      },
    },
    {
      types: ["punctuation", "symbol"],
      style: {
        color: "var(--text-color-code-plain)",
      },
    },
    {
      types: ["string", "char", "tag", "selector"],
      style: {
        color: "rgba(136, 184, 0, 1)",
      },
    },
    {
      types: ["keyword", "variable"],
      style: {
        color: "rgba(0, 160, 228, 1)",
      },
    },
    {
      types: ["comment"],
      style: {
        color: "var(--text-color-code-comments)",
      },
    },
    {
      types: ["attr-name"],
      style: {
        color: "rgba(0, 160, 228, 1)",
      },
    },
  ],
};
export default theme;
