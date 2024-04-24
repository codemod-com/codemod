type Range = { from: number; to: number };

const isSameRange = (range1: Range, range2: Range) => {
  return range1.from === range2.from && range1.to === range2.to;
};

export default isSameRange;
