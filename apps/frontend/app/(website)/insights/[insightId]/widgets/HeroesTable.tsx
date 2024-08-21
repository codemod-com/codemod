import { TableTile } from "@/app/(website)/insights/[insightId]/components/TableTile";
import type {
  MigrationHeroData,
  TransformerType,
} from "@/app/(website)/insights/[insightId]/view/[viewId]/types";
import { Clock, Code, Plus, Trash } from "@phosphor-icons/react";
import { User } from "../components/User";

export const migrationHeroesTransformer: TransformerType<MigrationHeroData> = {
  user: (value: { imageUrl: string; name: string }) => (
    <User imageUrl={value.imageUrl} name={value.name} />
  ),

  codemodsCreated: (value: number) => (
    <div className="flex items-center">
      <Code className="mr-2 text-blue-500" size={16} />
      <span>{value}</span>
    </div>
  ),

  prsReviewed: (value: number) => (
    <div className="flex items-center">
      <span className="font-medium">{value}</span>
    </div>
  ),

  averageReviewTime: (value: string) => (
    <div className="flex items-center">
      <Clock className="mr-2 text-gray-500" size={16} />
      <span>{value}</span>
    </div>
  ),

  timeToFirstReview: (value: string) => (
    <div className="flex items-center">
      <Clock className="mr-2 text-green-500" size={16} />
      <span>{value}</span>
    </div>
  ),

  linesOfCodeDeleted: (value: number) => (
    <div className="flex items-center text-red-500">
      <Trash className="mr-2" size={16} />
      <span>{value}</span>
    </div>
  ),

  linesOfCodeAdded: (value: number) => (
    <div className="flex items-center text-green-500">
      <Plus className="mr-2" size={16} />
      <span>{value}</span>
    </div>
  ),
};

export const HeroTable = ({
  data,
}: {
  data: MigrationHeroData[];
}) => (
  <TableTile
    columns={[
      "user",
      "codemodsCreated",
      "prsReviewed",
      "averageReviewTime",
      "timeToFirstReview",
      "linesOfCodeDeleted",
      "linesOfCodeAdded",
    ]}
    title={"Migration heroes"}
    data={data}
    transformer={migrationHeroesTransformer}
  />
);
