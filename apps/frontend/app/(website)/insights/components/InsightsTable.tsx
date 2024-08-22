"use client";
import { Table } from "@radix-ui/themes";

import Button from "@/components/shared/Button";
import { useViewStore } from "@/store/view";
import { MoreVertical, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useMemo } from "react";
import { useInsights } from "../hooks/useInsights";

const InsightsTable = () => {
  const { data: insightsData } = useInsights();
  const { insightsSearchTerm } = useViewStore();

  const filteredInsights = useMemo(
    () =>
      insightsData?.data.filter((insight) =>
        insight.name?.includes(insightsSearchTerm),
      ),
    [insightsSearchTerm, insightsData],
  );

  const { push } = useRouter();

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row align="start">
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Updated On</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell> &nbsp;</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {filteredInsights?.map((insight) => (
          <Table.Row
            key={insight.id}
            role="button"
            onClick={() => push(`/insights/${insight.id}`)}
          >
            <Table.Cell>{insight.name}</Table.Cell>
            <Table.Cell>{insight.updatedAt}</Table.Cell>
            <Table.Cell>{insight.ownerId}</Table.Cell>
            {/* <Table.Cell>
              <Avatar name={insight.owner.name} image={insight.owner.avatar} />
              {insight.owner.name}
            </Table.Cell> */}
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
