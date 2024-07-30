"use client"
import { cardData, depreciatedAPIData, prsMergedData, tableData } from "@/app/(website)/insights-dashboard/mockData";
import { CardTile } from "@/app/(website)/insights-dashboard/components/CardTile";
import { ChartTile } from "@/app/(website)/insights-dashboard/components/ChartTile";
import { TableTile } from "@/app/(website)/insights-dashboard/components/TableTile";

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">React 18 to 19 migration Campaign</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        { cardData.map((card, index) => (
          <CardTile key={ index } { ...card } />
        )) }
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ChartTile
          type="depreciatedAPI"
          data={ [
            {
              key: 'useContext (react 18)',
              data: depreciatedAPIData.useContextReact18
            },
            {
              key: 'use (react 19)',
              data: depreciatedAPIData.useReact19
            }
          ] }
        />
        <ChartTile
          type="prsMerged"
          data={ [
            {
              key: 'Remove memoization hooks codemod',
              data: prsMergedData.removeMemoizationHooks
            }
          ] }
        />
      </div>
      <div className="mb-6">
        <TableTile { ...tableData }  />
      </div>
    </div>
  );
};

export default DashboardPage;