"use client";
import Input from "@/components/shared/Input";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {
	placeholder?: string;
	onSearch: (key: string, value: string) => void;
};

const RegistrySectionSearch = ({ placeholder, onSearch }: Props) => {
	const inputWrapperRef = React.useRef<HTMLInputElement>(null);
	const router = useRouter();

	useEffect(() => {
		function handleFocus(event: KeyboardEvent) {
			const input = inputWrapperRef.current?.querySelector("input");
			if (event.metaKey && event.key === "k") {
				event.preventDefault();
				input?.focus();
			}
		}

		window.addEventListener("keydown", handleFocus);
		return () => {
			window.removeEventListener("keydown", handleFocus);
		};
	}, [router]);

	const [searchInput, setSearchInput] = useState("");
	return (
		<div className="flex w-full flex-1 items-center gap-3">
			<div
				ref={inputWrapperRef}
				onClick={() => {
					const input = inputWrapperRef.current?.querySelector("input");
					input?.focus();
				}}
				className="w-full"
			>
				<Input
					onChange={(e) => {
						onSearch("q", e.target.value);
						setSearchInput(e.target.value);
					}}
					placeholder={placeholder || "Search for Codemods"}
					icon={"search"}
					command={searchInput ? undefined : "⌘K"}
					onClear={() => {
						onSearch("q", "");
						setSearchInput("");
					}}
					value={searchInput}
				/>
			</div>
		</div>
	);
};

export default RegistrySectionSearch;
