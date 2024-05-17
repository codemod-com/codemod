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
  let sParams = new URLSearchParams(searchParams || "");
  let q = sParams.get("q") || "";
  let useCase = sParams.get(REGISTRY_FILTER_TYPES.useCase) || "";
  let framework = sParams.get(REGISTRY_FILTER_TYPES.framework) || "";
  let author = sParams.get(REGISTRY_FILTER_TYPES.owner) || "";
  let verified = sParams.get("verified");

  let filters = [
    q && `search=${q}`,
    useCase && `category=${useCase}`,
    author && `author=${author}`,
    framework && `framework=${framework}`,
    verified && `verified=${verified}`,
  ];
  let filtersString = filters.filter(Boolean).join("&");
  let queryString = `${filtersString}&page=${pageNumber}&size=${entriesPerPage}`;

  return queryString;
}
