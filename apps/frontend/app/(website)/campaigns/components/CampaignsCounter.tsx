type Props = {
  campaignCount: number;
};
const CampaignsCounter = ({ campaignCount }: Props) => {
  return <p className="font-regular">{campaignCount} Campaigns</p>;
};

export default CampaignsCounter;
