import { REGISTRY_FILTER_TYPES } from "@/constants";

export function buildRegistryIndexDataQuery({
  entriesPerPage = 20,
  searchParams,
  pageNumber = 1,
}: {
  entriesPerPage: number;
  searchParams: URLSearchParams;
  pageNumber: number;
}) {
  const sParams = new URLSearchParams(searchParams || "");
  const q = sParams.get("q") || "";
  const useCase = sParams.get(REGISTRY_FILTER_TYPES.useCase) || "";
  const framework = sParams.get(REGISTRY_FILTER_TYPES.framework) || "";
  const author = sParams.get(REGISTRY_FILTER_TYPES.owner) || "";
  const verified = sParams.get("verified");

  const filters = [
    q && `search=${q}`,
    useCase && `category=${useCase}`,
    author && `author=${author}`,
    framework && `framework=${framework}`,
    verified && `verified=${verified}`,
  ];
  const filtersString = filters.filter(Boolean).join("&");
  const queryString = `${filtersString}&page=${pageNumber}&size=${entriesPerPage}`;

  return queryString;
}
