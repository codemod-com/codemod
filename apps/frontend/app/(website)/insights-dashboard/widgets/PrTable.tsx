import { TableTile } from "@/app/(website)/insights-dashboard/components/TableTile";
import type {
  ColumnDefinition,
  MigrationPrTable,
  TransformerType,
} from "@/app/(website)/insights-dashboard/types";
import {
  ArrowClockwise,
  Check,
  Clock,
  Files,
  GitBranch,
} from "@phosphor-icons/react";
import { User } from "../components/User";

export const prTransformer: TransformerType<MigrationPrTable> = {
  task: (value: string) => <span className="font-medium">{value}</span>,

  pr: (value: string) => (
    <div className="flex items-center">
      <GitBranch className="mr-2 text-gray-500" size={16} />
      <span>{value}</span>
    </div>
  ),

  status: (value: string) => {
    const isInReview = value === "In Review";
    const Icon = isInReview ? ArrowClockwise : Check;
    const color = isInReview ? "text-yellow-500" : "text-green-500";

    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="mr-2" size={16} />
        <span>{value}</span>
      </div>
    );
  },

  reviewer: (value: { imageUrl: string; name: string }) => (
    <User imageUrl={value.imageUrl} name={value.name} />
  ),

  filesChanged: (value: number) => (
    <div className="flex items-center">
      <Files className="mr-2 text-gray-500" size={16} />
      <span>{value}</span>
    </div>
  ),

  timeSaving: (value: string) => (
    <div className="flex items-center text-green-500">
      <Clock className="mr-2" size={16} />
      <span>{value}</span>
    </div>
  ),
};

const columns: ColumnDefinition[] = [
  "task",
  "pr",
  { title: "status", description: "Current status of the Pull Request" },
  "reviewer",
  "filesChanged",
  { title: "timeSaving", description: "Estimated time saved by this PR" },
];

export const PrTable = ({
  title,
  data,
}: {
  title: string;
  data: MigrationPrTable[];
}) => (
  <TableTile
    columns={columns}
    title={title}
    data={data}
    transformer={prTransformer}
  />
);
