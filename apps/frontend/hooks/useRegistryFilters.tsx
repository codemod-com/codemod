import { slugify } from "@tinloof/sanity-web";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useRegistryFilters() {
	const search = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	function toggleFilters(all = false) {
		// Clear Everything
		if (typeof all === "boolean" && all) {
			router.prefetch("/registry");
			return router.push("/registry");
		}
		// Clear filter buttons only - leaving search query
		const searchQuery = search.get("q");
		router.prefetch("/registry" + (searchQuery ? `?q=${searchQuery}` : ""));
		return router.push("/registry" + (searchQuery ? `?q=${searchQuery}` : ""));
	}

	function handleFilterChange(filterPath: string, slug?: string) {
		const newParams = new URLSearchParams(search.toString());

		if (!slug || slug === slugify("") || slug === newParams.get(filterPath)) {
			newParams.delete(filterPath);
			router.prefetch(pathname + "?" + newParams.toString());
			router.push(pathname + "?" + newParams.toString(), { scroll: false });
			return;
		}

		newParams.set(filterPath, slug);
		router.prefetch(pathname + "?" + newParams.toString());
		router.push(pathname + "?" + newParams.toString(), { scroll: false });
	}
	function prefetchFilterChange(filterPath: string, slug?: string) {
		const newParams = new URLSearchParams(search.toString());

		if (!slug || slug === slugify("") || slug === newParams.get(filterPath)) {
			newParams.delete(filterPath);
			router.prefetch(pathname + "?" + newParams.toString());
			return;
		}

		newParams.set(filterPath, slug);
		router.prefetch(pathname + "?" + newParams.toString());
	}

	return {
		handleFilterChange,
		prefetchFilterChange,
		toggleFilters,
	};
}
