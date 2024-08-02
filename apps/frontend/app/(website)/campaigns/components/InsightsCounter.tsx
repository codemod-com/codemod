type Props = {
  insightsCount: number;
};
const InsightsCounter = ({ insightsCount }: Props) => {
  // @TODO
  return <p className="font-regular">{insightsCount} insights</p>;
};

export default InsightsCounter;
