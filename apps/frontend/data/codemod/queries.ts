import { REGISTRY_FILTER_TYPES } from "@/constants";

export function buildRegistryIndexDataQuery({
  entriesPerPage = 20,
  searchParams,
  pageNumber = 1,
}: {
  entriesPerPage: number;
  searchParams: string | URLSearchParams;
  pageNumber: number;
}) {
  const sParams = new URLSearchParams(searchParams || "");
  const params = new URLSearchParams();
  const q = sParams.get("q");
  const useCase = sParams.get(REGISTRY_FILTER_TYPES.useCase);
  const framework = sParams.get(REGISTRY_FILTER_TYPES.framework);

  if (q) params.set("q", q);
  if (useCase) params.set("category", useCase);
  if (framework) params.set("framework", framework);

  params.set("page", String(pageNumber));
  params.set("limit", String(entriesPerPage));

  return params.toString();
}
