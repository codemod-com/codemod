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
	const parentRef = createRef<HTMLDivElement>();
	const childRef = createRef<HTMLDivElement>();
	const childSticky = useRef<"top" | "bottom" | "none">("none");
	const scrollY = useRef(0);
	const y = useRef(0);

	const positionChild = useCallback(() => {
		const child = childRef.current;
		const parent = parentRef.current;

		if (!child || !parent || Math.abs(y.current - window.scrollY) < 15) {
			y.current = window.scrollY;
			return;
		}

		y.current = window.scrollY;

		const parentRect = parent.getBoundingClientRect();
		const childRect = child.getBoundingClientRect();

		const childTop = childRect.top;
		const childHeight = childRect.height;

		const scrollingUp = scrollY.current > window.scrollY;
		const scrollingDown = scrollY.current < window.scrollY;
		const changeDown = scrollingDown && childSticky.current === "top";
		const changeUp = scrollingUp && childSticky.current === "bottom";
		const changeDirection = changeDown || changeUp;

		const viewPortHeight =
			Math.max(document.documentElement.clientHeight, window.innerHeight || 0) -
			top;
		const fitsInViewPort = childHeight < viewPortHeight;

		const childAboveViewBottom = childTop < viewPortHeight - childHeight;
		const childBelowViewTop = childTop > top;
		const childInMiddle = !childBelowViewTop && !childAboveViewBottom;
		const childEdgeInView = childBelowViewTop || childAboveViewBottom;

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

		const childStyle: any = {};
		const parentStyle: any = {
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
