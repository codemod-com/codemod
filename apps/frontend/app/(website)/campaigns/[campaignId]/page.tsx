import { migrationPrData } from "@/app/(website)/campaigns/[campaignId]/mockData";
import { CustomTable } from "@/app/(website)/campaigns/[campaignId]/widgets/CustomTable";
import SecondaryHeader from "./components/SecondaryHeader";

const DashboardPage = () => {
  return (
    <>
      <SecondaryHeader />
      <div className="w-full">
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="p-6">
              <CustomTable
                data={migrationPrData.data}
                title="React 18.3.1 incompatible packages "
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
