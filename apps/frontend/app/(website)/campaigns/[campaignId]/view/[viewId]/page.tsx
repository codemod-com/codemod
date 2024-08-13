"use client";
import {
  cardData,
  customData,
  customData2,
  depreciatedAPIData,
  heroData,
  migrationPrData,
  prsMergedData,
} from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/mockData";
import {
  HeroTable,
  MergedPRsCard,
  PrTable,
  ReviewTimeCard,
  TimeSavedCard,
} from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/widgets";
import { CustomChart } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/widgets/CustomChart";
import { CustomTable } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/widgets/CustomTable";
import { DepreciatedAPIChart } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/widgets/DepreciatedAPIChart";
import { PrsMergedChart } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/widgets/PrsMergedChart";

const MigrationDashboardCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-1">
        <TimeSavedCard
          data={cardData.timeSaving.value}
          change={cardData.timeSaving.change}
          timePeriod="3 months"
        />
      </div>
      <div className="col-span-1">
        <ReviewTimeCard
          data={cardData.reviewTime.value}
          change={cardData.reviewTime.change}
          timePeriod="3 months"
        />
      </div>
      <div className="col-span-1">
        <MergedPRsCard
          data={cardData.mergedPRs.value as number}
          change={cardData.mergedPRs.change}
          timePeriod="3 months"
        />
      </div>
    </div>
  );
};

const DashboardPage: React.FC = ({ data: any }) => {
  return (
    <div className="w-full">
      <div className="px-m pb-[80px] lg:px-[64px]">
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              React 18 to 19 migration Campaign
            </h1>

            <div className="mb-8">
              <MigrationDashboardCards />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <DepreciatedAPIChart data={depreciatedAPIData} />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <PrsMergedChart data={prsMergedData} />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <CustomChart data={customData} />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <CustomChart data={customData2} />
              </div>
            </div>

            <div className="p-6">
              <PrTable {...migrationPrData} />
            </div>

            <div className="p-6">
              <HeroTable data={heroData} />
            </div>

            <div className="p-6">
              <CustomTable data={migrationPrData.data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
