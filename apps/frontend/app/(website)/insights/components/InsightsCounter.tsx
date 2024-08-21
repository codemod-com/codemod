type Props = {
  insightCount: number;
};
const InsightsCounter = ({ insightCount }: Props) => {
  return <p className="font-regular">{insightCount} Insights</p>;
};

export default InsightsCounter;
