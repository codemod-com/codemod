"use client";
import { Table } from "@radix-ui/themes";

import Button from "@/components/shared/Button";
import { useViewStore } from "@/store/view";
import { MoreVertical, Star } from "lucide-react";
import { memo, useMemo } from "react";
import type { TabsConfig } from "../hooks/useInsightsTabsConfig";

type InsightKind = TabsConfig[number]["kind"];

const InsightsTable = ({
  type,
  insights,
}: { type: InsightKind; insights: any }) => {
  const { insightsSearchTerm } = useViewStore();

  const migrations = useMemo(() => {
    return insights.migrations.filter(
      (migration) =>
        (migration.type === type || type === "all") &&
        migration.name.includes(insightsSearchTerm),
    );
  }, [type, insights, insightsSearchTerm]);

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row align="start">
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Updated On</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell> &nbsp;</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {migrations.map((migration) => (
          <Table.Row>
            <Table.RowHeaderCell>{migration.name}</Table.RowHeaderCell>
            <Table.Cell>{migration.category}</Table.Cell>
            <Table.Cell>{migration.updatedOn}</Table.Cell>
            <Table.Cell>{migration.owner}</Table.Cell>
            <Table.Cell className="flex">
              <Button intent="secondary-icon-only" className="!border-0">
                <Star size={16} />
              </Button>
              <Button intent="secondary-icon-only" className="!border-0">
                <MoreVertical size={16} />
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default memo(InsightsTable);
