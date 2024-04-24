export default function defineFooterAddOn() {
  return {
    type: "reference",
    to: [
      { type: "pageCta" },
      { type: "pageCtaDouble" },
      { type: "pageCtaTriple" },
    ],
    name: "cta",
    title: "Page CTA (Optional)",
    description:
      "Call to action for a page. This is placed at the bottom of the page before the footer",
  };
}
