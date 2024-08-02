"use client";
import { Table } from "@radix-ui/themes";

import Button from "@/components/shared/Button";
import { useViewStore } from "@/store/view";
import { MoreVertical, Star } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import type { TabsConfig } from "../hooks/useInsightsTabsConfig";

type InsightKind = TabsConfig[number]["kind"];

const CampaignsTable = ({
  type,
  insights,
}: { type: InsightKind; insights: any }) => {
  const { insightsSearchTerm } = useViewStore();

  // const migrations = useMemo(() => {
  //   return insights.migrations.filter(
  //     (migration) =>
  //       (migration.type === type || type === "all") &&
  //       migration.name.includes(insightsSearchTerm),
  //   );
  // }, [type, insights, insightsSearchTerm]);

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row align="start">
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Updated On</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Link</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell> &nbsp;</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          <Table.RowHeaderCell>
            Technical debt remediation campaign
          </Table.RowHeaderCell>
          <Table.Cell>???</Table.Cell>
          <Table.Cell>{new Date().toLocaleString()}</Table.Cell>
          <Table.Cell>Alex</Table.Cell>
          <Table.Cell>
            {" "}
            <Link href="/to_dashboards">Open</Link>
          </Table.Cell>
          <Table.Cell className="flex">
            <Button intent="secondary-icon-only" className="!border-0">
              <Star size={16} />
            </Button>
            <Button intent="secondary-icon-only" className="!border-0">
              <MoreVertical size={16} />
            </Button>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
};

export default memo(CampaignsTable);
