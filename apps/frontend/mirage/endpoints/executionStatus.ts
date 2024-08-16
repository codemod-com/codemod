import type { Result } from "@codemod-com/api-types";
import type { Server } from "miragejs";
import type { AppRegistry } from "..";

const isSuccess = true;
const errorExecutionResult: Result = {
  status: "error",
  message: "error msg",
};

const result = [
  {
    name: "netlify-react-ui",
    drift: 0,
    timestamp: "2016-02-13T06:39:36.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 35.35185527423561,
    timestamp: "2016-12-12T08:21:10.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 77.52109899587259,
    timestamp: "2017-06-15T13:49:49.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 34.399063635803614,
    timestamp: "2017-09-15T23:46:10.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 43.8585323449489,
    timestamp: "2017-12-01T23:17:14.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 48.25834890517943,
    timestamp: "2018-04-19T22:06:04.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 113.00711171345066,
    timestamp: "2019-05-09T16:56:45.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 142.19867622196207,
    timestamp: "2020-07-23T07:26:12.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 10.07275987871072,
    timestamp: "2021-02-10T20:54:49.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 27.866417517129033,
    timestamp: "2021-07-23T10:14:44.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 47.68886424772583,
    timestamp: "2022-02-02T17:05:28.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 32.95344873611367,
    timestamp: "2022-06-16T16:36:37.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 18.97643346543735,
    timestamp: "2022-10-20T16:16:02.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 26.168915172796158,
    timestamp: "2023-02-01T19:14:06.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 22.48369234138962,
    timestamp: "2023-03-31T15:52:10.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 25.098393533063646,
    timestamp: "2023-06-08T16:05:31.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 27.756901236849487,
    timestamp: "2023-08-18T14:54:48.000Z",
    label: "real_drift",
  },
  {
    name: "netlify-react-ui",
    drift: 39.07814671074697,
    timestamp: "2023-10-31T18:42:55.000Z",
    label: "real_drift",
  },
  {
    name: "@netlify/source",
    drift: 31.031438017207748,
    timestamp: "2024-02-07T12:17:32.000Z",
    label: "real_drift",
  },
  {
    name: "@netlify/source",
    drift: 30.037577773670915,
    timestamp: "2024-04-24T12:47:15.000Z",
    label: "real_drift",
  },
  {
    name: "@netlify/source",
    drift: 40.258184630759025,
    timestamp: "2024-08-13T14:15:00.000Z",
    label: "real_drift",
  },
];

const buildGetResponse = () => {
  const responses = [
    [
      {
        status: "queued",
        message: "Codemod queued",
        id: "1",
        codemod: "drift_analyzer",
        progress: 0,
      },
    ],
    [
      {
        status: "in_progress",
        message: "Processing codemod",
        id: "2",
        codemod: "drift_analyzer",
        progress: 20,
      },
    ],
    [
      {
        status: "in_progress",
        message: "Processing codemod",
        id: "3",
        codemod: "drift_analyzer",
        progress: 40,
      },
    ],
    [
      {
        status: "in_progress",
        message: "Processing codemod",
        id: "4",
        codemod: "drift_analyzer",
        progress: 70,
      },
    ],
    [
      {
        status: "in_progress",
        message: "Processing codemod",
        id: "5",
        codemod: "drift_analyzer",
        progress: 90,
      },
    ],
    [
      {
        status: "success",
        message: "Successfully processed",
        id: "6",
        codemod: "drift_analyzer",
        progress: 100,
        result: JSON.stringify(result),
      },
    ],
  ];

  let index = 0;

  return () => {
    const currentResponse = responses[index];

    if (index < responses.length - 1) {
      index++;
    }

    return currentResponse;
  };
};

const getResponse = buildGetResponse();

export const executionStatusEndpoints = (server: Server<AppRegistry>) => {
  server.get("/run/codemodRun/status", () => {
    const nextResponse = getResponse();

    return nextResponse;
  });
};
