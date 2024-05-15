import { matchSorter } from "match-sorter";
import { useMemo } from "react";

export function useFilteredItems<T>(
  items: T[],
  filterValue: string | undefined,
  selectedItem: T | undefined,
  key: keyof T,
) {
  return useMemo(() => {
    if (!filterValue) return items;
    const matches = matchSorter(items, filterValue, { keys: [key as string] });
    if (selectedItem && !matches.includes(selectedItem)) {
      matches.push(selectedItem);
    }
    return matches;
  }, [filterValue, selectedItem, items]);
}
