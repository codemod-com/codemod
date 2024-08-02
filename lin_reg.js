const data = [
  {
    name: "netlify-react-ui",
    drift: 14.456148996899321,
    timestamp: "2016-07-14T21:43:35.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 35.13556062068351,
    timestamp: "2016-12-16T17:13:46.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 74.85711547807277,
    timestamp: "2017-05-19T21:41:57.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 38.453903913153596,
    timestamp: "2017-10-22T04:47:24.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 46.59096353792343,
    timestamp: "2018-03-26T20:31:20.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 65.61667932948656,
    timestamp: "2018-08-27T18:45:16.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 93.24763684401455,
    timestamp: "2019-01-29T17:46:05.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 73.27734313504043,
    timestamp: "2019-07-03T18:30:26.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 105.14931860339362,
    timestamp: "2019-12-04T17:56:13.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 130.62828121042867,
    timestamp: "2020-05-07T20:54:14.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 133.36071240340317,
    timestamp: "2020-10-09T15:28:02.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 11.425285940163043,
    timestamp: "2021-03-13T03:12:09.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 31.299752903892628,
    timestamp: "2021-08-16T13:08:06.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 44.67990444704546,
    timestamp: "2022-01-17T09:16:29.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 33.07939245843514,
    timestamp: "2022-06-21T09:19:49.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 19.1078530017728,
    timestamp: "2022-11-22T12:22:49.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 24.813651204336843,
    timestamp: "2023-04-26T08:28:28.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 32.890476874952945,
    timestamp: "2023-09-27T22:38:57.000Z",
    label: "real_drift",
  },
  {
    name: "@netlify/source",
    drift: 30.492070336831013,
    timestamp: "2024-02-29T22:03:14.000Z",
    label: "real_drift",
  },
].map((d) => ({ ...d, value: d.drift, timestamp: new Date(d.timestamp) }));

function predictNextDataPoints(data, numPredictions) {
  // Convert dates to numbers for simplicity (milliseconds since epoch)
  const x = data.map((d) => {
    return d.timestamp.getTime();
  });
  const y = data.map((d) => d.value);

  console.log([...y], "??");
  // Calculate the means of x and y
  const xMean = x.reduce((sum, xi) => sum + xi, 0) / x.length;
  const yMean = y.reduce((sum, yi) => sum + yi, 0) / y.length;

  // Calculate the numerator and denominator for the slope (m)
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < x.length; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }
  const slope = numerator / denominator;

  // Calculate the intercept (b)
  const intercept = yMean - slope * xMean;
  console.log(yMean, xMean, numerator, denominator, "???");
  // Predict the next data points
  const predictions = [];
  const lastTimestamp = x[x.length - 1];
  const timeStep = x.length > 1 ? x[1] - x[0] : 1; // assuming uniform time intervals

  for (let i = 1; i <= numPredictions; i++) {
    const nextTimestamp = new Date(lastTimestamp + i * timeStep);

    const nextValue = slope * (lastTimestamp + i * timeStep) + intercept;
    predictions.push({ value: nextValue, timestamp: nextTimestamp });
  }

  return predictions;
}

const predictedData = predictNextDataPoints(data, 20).map((d) => ({
  timestamp: d.timestamp.toISOString(),
  drift: d.value,
  name: "predicted",
}));

console.log(JSON.stringify(predictedData));
