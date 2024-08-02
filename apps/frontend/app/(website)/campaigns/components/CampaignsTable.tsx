"use client";
import { Table } from "@radix-ui/themes";

import Button from "@/components/shared/Button";
import { useViewStore } from "@/store/view";
import { MoreVertical, Star } from "lucide-react";
import Link from "next/link";
import { memo, useMemo } from "react";
import type { TabsConfig } from "../hooks/useCampaigTabsConfig";

type InsightKind = TabsConfig[number]["kind"];

type Campaign = {
  id: string;
  name: string;
  owner: string;
  category: string;
  createdAt: string;
};

const mockCampaigns: Campaign[] = [
  {
    id: "123",
    name: "Technical debt remediation campaign",
    owner: "Alex",
    category: "Technical debt",
    createdAt: new Date().toLocaleDateString(),
  },
];

const CampaignsTable = ({
  type,
  campaigns,
}: { type: InsightKind; campaigns: any }) => {
  const { campaignsSearchTerm } = useViewStore();

  // const migrations = useMemo(() => {
  //   return insights.migrations.filter(
  //     (migration) =>
  //       (migration.type === type || type === "all") &&
  //       migration.name.includes(campaignsSearchTerm),
  //   );
  // }, [type, insights, campaignsSearchTerm]);

  const filteredCampaigns = useMemo(
    () =>
      mockCampaigns.filter((campaign) =>
        campaign.name.includes(campaignsSearchTerm),
      ),
    [campaignsSearchTerm, mockCampaigns],
  );

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
        {filteredCampaigns.map((campaign) => (
          <Table.Row>
            <Table.Cell>{campaign.name}</Table.Cell>
            <Table.Cell>{campaign.category}</Table.Cell>
            <Table.Cell>{campaign.createdAt}</Table.Cell>
            <Table.Cell>{campaign.owner}</Table.Cell>
            <Table.Cell>
              <Link href={`/campaigns/${campaign.id}`}>Open</Link>
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
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default memo(CampaignsTable);
