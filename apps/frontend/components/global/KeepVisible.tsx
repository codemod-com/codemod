"use client";

import { createRef, useCallback, useEffect, useRef } from "react";

type KeepVisibleProps = {
  top: number;
  bottom?: number;
  children?: JSX.Element;
};

export default function KeepVisible({
  top,
  bottom,
  children,
}: KeepVisibleProps) {
  let parentRef = createRef<HTMLDivElement>();
  let childRef = createRef<HTMLDivElement>();
  let childSticky = useRef<"top" | "bottom" | "none">("none");
  let scrollY = useRef(0);
  let y = useRef(0);

  let positionChild = useCallback(() => {
    let child = childRef.current;
    let parent = parentRef.current;

    if (!child || !parent || Math.abs(y.current - window.scrollY) < 15) {
      y.current = window.scrollY;
      return;
    }

    y.current = window.scrollY;

    let parentRect = parent.getBoundingClientRect();
    let childRect = child.getBoundingClientRect();

    let childTop = childRect.top;
    let childHeight = childRect.height;

    let scrollingUp = scrollY.current > window.scrollY;
    let scrollingDown = scrollY.current < window.scrollY;
    let changeDown = scrollingDown && childSticky.current === "top";
    let changeUp = scrollingUp && childSticky.current === "bottom";
    let changeDirection = changeDown || changeUp;

    let viewPortHeight =
      Math.max(document.documentElement.clientHeight, window.innerHeight || 0) -
      top;
    let fitsInViewPort = childHeight < viewPortHeight;

    let childAboveViewBottom = childTop < viewPortHeight - childHeight;
    let childBelowViewTop = childTop > top;
    let childInMiddle = !childBelowViewTop && !childAboveViewBottom;
    let childEdgeInView = childBelowViewTop || childAboveViewBottom;

    scrollY.current = window.scrollY;

    if (fitsInViewPort) {
      parent.style.justifyContent = "";
      child.style.position = "sticky";
      child.style.top = `${top}px`;
      child.style.transition = "top 0.5s ease-out";
      child.style.bottom = "";
      return;
    }
    child.style.transition = "";

    let childStyle: any = {};
    let parentStyle: any = {
      height: "100%",
      display: "flex",
      flexDirection: "column",
    };

    if (changeDirection && childInMiddle) {
      parentStyle.justifyContent = "";
      childSticky.current = "none";
      childStyle.position = "relative";
      childStyle.top = `${childRect.top - parentRect.top}px`;
      childStyle.bottom = "";
    } else if (scrollingDown && childEdgeInView) {
      parentStyle.justifyContent = "flex-end";
      childSticky.current = "bottom";
      childStyle.position = "sticky";
      childStyle.bottom = `${bottom}px`;
      childStyle.top = "";
    } else if (scrollingUp && childEdgeInView) {
      parentStyle.justifyContent = "";
      childSticky.current = "top";
      childStyle.position = "sticky";
      childStyle.top = `${top}px`;
      childStyle.bottom = "";
    } else {
      if (childStyle.top) {
        childStyle.top = `${top}px`;
      }
    }

    Object.assign(parent.style, parentStyle);
    Object.assign(child.style, childStyle);
  }, [childRef, parentRef, top, bottom]);

  useEffect(() => {
    window.addEventListener("resize", positionChild, { passive: true });
    window.addEventListener("scroll", positionChild, { passive: true });
    positionChild();

    return () => {
      window.removeEventListener("resize", positionChild);
      window.removeEventListener("scroll", positionChild);
    };
  }, [positionChild]);

  return (
    <div ref={parentRef} className="h-full">
      <div ref={childRef}>{children}</div>
    </div>
  );
}
