import { migrationPrData } from "@/app/(website)/campaigns/[campaignId]/mockData";
import { CustomTable } from "@/app/(website)/campaigns/[campaignId]/widgets/CustomTable";
import SecondaryHeader from "./components/SecondaryHeader";

type Widget = {
  kind: "Table";
  title: string;
  workflow: string;
  data: any;
};

const widgets: Widget[] = [
  {
    kind: "Table",
    workflow: "incompatible-packages",
    title: "React 18.3.1 incompatible packages",
    data: migrationPrData.data,
  },
];

const renderWidget = (widget: Widget) => {
  switch (widget.kind) {
    case "Table": {
      return <CustomTable title={widget.title} data={widget.data} />;
    }
    default:
      return null;
  }
};

const DashboardPage = () => {
  return (
    <>
      <SecondaryHeader />
      <div className="w-full">
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="p-6">{widgets.map(renderWidget)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
