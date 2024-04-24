"use client";

import type { QueryResponseInitial } from "@sanity/react-loader/rsc";

import { buildRegistryIndexQuery } from "@/data/sanity/queries";
import { useQuery } from "@/data/sanity/useQuery";
import type { RegistryIndexPayload } from "@/types";

import RegistryIndex from "./RegistryIndex";

type PreviewRouteProps = {
  searchParams?: URLSearchParams;
  initial: QueryResponseInitial<RegistryIndexPayload | null>;
};

export default function RegistryIndexPreview(props: PreviewRouteProps) {
  const { initial, searchParams } = props;
  const registryEntries = initial?.data?.entries || [];
  const registryIndexQuery = buildRegistryIndexQuery();

  const { data } = useQuery<RegistryIndexPayload | null>(
    registryIndexQuery,
    { pathname: "/registry" },
    { initial },
  );

  return data ? (
    <RegistryIndex
      data={{
        ...data,
        entries: registryEntries,
      }}
    />
  ) : null;
}
