"use client";
import { Table } from "@radix-ui/themes";

import Link from "next/link";
import { memo } from "react";

type Dashboard = {
  id: string;
  name: string;
  owner: string;
  createdAt: string;
};

const mockDashboards: Dashboard[] = [
  {
    id: "123",
    name: "Default Dashboard",
    owner: "Alex",
    createdAt: new Date().toLocaleDateString(),
  },
];

const DashboardTable = ({ dashboards }: { dashboards: Dashboard[] }) => {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row align="start">
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Updated On</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Link</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {mockDashboards.map((dashboard) => (
          <Table.Row>
            <Table.Cell>{dashboard.name}</Table.Cell>
            <Table.Cell>{dashboard.createdAt}</Table.Cell>
            <Table.Cell>{dashboard.owner}</Table.Cell>
            <Table.Cell>
              <Link href={`/dashboards/${dashboard.id}`}>Open</Link>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default memo(DashboardTable);
