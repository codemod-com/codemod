"use client";
import { Table } from "@radix-ui/themes";

import Button from "@/components/shared/Button";
import { useViewStore } from "@/store/view";
import { MoreVertical, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useMemo } from "react";
import type { TabsConfig } from "../hooks/useCampaigTabsConfig";
import type { Campaign } from "../hooks/useCampaigns";
type InsightKind = TabsConfig[number]["kind"];

const CampaignsTable = ({
  campaigns,
}: { type: InsightKind; campaigns: Campaign[] }) => {
  const { campaignsSearchTerm } = useViewStore();

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) =>
        campaign.name.includes(campaignsSearchTerm),
      ),
    [campaignsSearchTerm, campaigns],
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
        {filteredCampaigns.map((campaign) => (
          <Table.Row
            role="button"
            onClick={() => push(`/campaigns/${campaign.id}`)}
          >
            <Table.Cell>{campaign.name}</Table.Cell>
            <Table.Cell>{campaign.updatedAt}</Table.Cell>
            <Table.Cell>{campaign.owner}</Table.Cell>
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
