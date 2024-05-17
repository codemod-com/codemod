"use client";

import { type PropsWithChildren, useState } from "react";
import AccordionItemInternal from "./AccordionItemInternal";

type AccordionItemProps = PropsWithChildren<{
  id?: string;
  title: string;
  border?: boolean;
  className?: string;
  variant?: "faq" | "toc";
}>;

export default function AccordionItem({
  id,
  title,
  border = true,
  className,
  variant = "faq",
  children,
}: AccordionItemProps) {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <AccordionItemInternal
      id={id}
      title={title}
      border={border}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className={className}
      variant={variant}
    >
      {children}
    </AccordionItemInternal>
  );
}
