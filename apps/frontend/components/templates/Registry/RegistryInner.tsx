"use client";

import CodemodList from "@/components/templates/Registry/CodemodList";
import type { RegistryIndexPayload } from "@/types";
import { cx } from "cva";
import { motion } from "framer-motion";
import RegistryFilters from "./RegistryFilters";
import { useSidebar } from "./context";
export type RegistryIndexProps = {
	data: RegistryIndexPayload;
};

export default function RegistryInner({ data }: RegistryIndexProps) {
	const { desktopOpen } = useSidebar();

	const gridVariants = {
		open: {
			x: `var(--sidebar-open-x)`,
			width: `var(--sidebar-open-width)`,
			transition: { duration: 0.3, ease: "easeOut" },
			gridTemplateColumns: `var(--sidebar-open-grid-template-columns)`,
		},
		closed: {
			x: `var(--sidebar-closed-x)`,
			width: `var(--sidebar-closed-width)`,
			transition: { duration: 0.3, ease: "easeOut" },
			gridTemplateColumns: `var(--sidebar-closed-grid-template-columns)`,
		},
	};

	return (
		<div
			className={cx(
				"overflow-x-clip",
				"[--sidebar-open-grid-template-columns:290px_3fr] [--sidebar-open-width:100%] [--sidebar-open-x:0px]",
				"[--sidebar-closed-grid-template-columns:290px_3fr] [--sidebar-closed-width:100%] [--sidebar-closed-x:0px]",
				"lg:[--sidebar-closed-grid-template-columns:290px_4fr] lg:[--sidebar-closed-width:120.5%] lg:[--sidebar-closed-x:-280px]",
			)}
		>
			<motion.div
				initial={desktopOpen ? "open" : "closed"}
				animate={desktopOpen ? "open" : "closed"}
				variants={gridVariants}
				className="lg:grid"
			>
				{<RegistryFilters {...data} />}
				{data?.entries && <CodemodList initial={data} />}
			</motion.div>
		</div>
	);
}
