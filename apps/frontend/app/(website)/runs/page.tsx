"use client";

import { useAuth } from "@/app/auth/useAuth";
import Button from "@/components/shared/Button";
import { ChartBar, GithubLogo } from "@phosphor-icons/react";
import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";
import { DataTable } from "../insights/components/table/table";
import { Card } from "../studio/src/components/ui/card";
import { useCodemodRuns } from "./hooks/useCodemodRuns";

const InsightsPage = () => {
  const { data: codemodRuns } = useCodemodRuns();

  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return (
      <Card className="flex flex-col md:flex-row items-center p-6 space-y-6 md:space-y-0 md:space-x-6 bg-white shadow-lg rounded-lg w-1/2 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <ChartBar className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Codemod Insights</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Build or modify auto-generated dashboards to manage and track
            external, internal, and incremental migrations across your entire
            stack, all powered by codemods.
          </p>

          <Separator className="my-2 bg-gray-400 h-[1px] opacity-75" />

          <p className="mt-4 text-sm">Connect your GitHub to get started.</p>
          <Link href="/auth/sign-in">
            <Button
              className="mt-4 flex items-center justify-center space-x-2 flex-nowrap w-full"
              loadingOpacity={false}
              intent="primary"
              role="link"
            >
              <GithubLogo className="w-5 h-5" />
              <span>Sign in with GitHub</span>
            </Button>
          </Link>
        </div>

        <div className="flex-1">
          <img
            src="/insights-preview.png"
            alt="Insights Preview"
            className=""
          />
        </div>
      </Card>
    );
  }

  return (
    <DataTable
      data={codemodRuns?.data ?? []}
      columns={[
        { accessorKey: "repoUrl", header: "Repository URL" },
        {
          accessorKey: "data",
          header: "Data",
          cell: (row) => JSON.stringify(row.data),
        },
        { accessorKey: "createdAt", header: "Created At" },
      ]}
    />
  );
};

export default InsightsPage;
