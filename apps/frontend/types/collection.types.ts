import type { BlocksBody, PublishStatus } from "@/types";
import type { BasicPageDocumentPayload, MinimalDocForPath } from "./index";

export interface CollectionIndexBaseData {
  _type: string;
  body?: BlocksBody;
  collectionTitle?: string;
  filterTitle?: string;
  defaultFilterTitle?: string;
}

export type RouteData<
  Options extends {
    localized: boolean;
    /**
     * The data of the current document _type's schema
     */
    DocData: {};

    ExtraData?: {};
  },
> = BasicPageDocumentPayload &
  Options["ExtraData"] & {
    routeData: {
      _type: string;
      _id: string;
      pathname?: { current: string };
      publishStatus?: PublishStatus;
    } & Options["DocData"];
  };

export type CollectionRouteData<
  Options extends {
    /**
     * If the collection's routing config has `entriesPerPage = undefined`, it's not paginated.
     * If it is, routes will receive `pageNum` and `entriesPerPage` as extra props.
     */
    paginated: boolean;

    /**
     * If the collection's routing config has `filters = undefined`, it's not filterable.
     * If it is, routes will receive `filter` (only in filtered states) and `filterOptions` as extra props.
     */
    filterable: boolean;

    /**
     * The data fetched for each document in the collection, as defined by `entryQueryFragment` in the collection's routing config.
     */
    EntryData: {};

    /**
     * The data fetched for the `collectionIndex` document, as defined by `docQuery` in the collection's routing config.
     */
    CollectionDocData: {};

    /**
     * The data to fetch for each reference filter currently applied to the collection,
     * as defined by `currentFilterQueryFragment` in the collection's routing config.
     */
    CurrentFilterDocData?: {};
  },
> = RouteData<{
  localized: true;
  DocData: Options["CollectionDocData"];
  ExtraData: {
    entriesCount?: number;
    entries: Options["EntryData"][];
  } & (Options["paginated"] extends true
    ? {
        pageNum?: number;
        entriesPerPage?: number;
      }
    : {}) &
    (Options["filterable"] extends true
      ? CollectionFilteredData<Options["CurrentFilterDocData"]>
      : {});
}>;

export interface CollectionFilteredData<
  CurrentFilterDocData = MinimalDocForPath & { title: string },
> {
  referenceFilterOptions?: Record<
    // basePath
    string,
    ({
      title: string;
      entriesCount: number;
    } & MinimalDocForPath)[]
  >;
  currentReferenceFilters?: CurrentFilterDocData[];
}
