import type { Result } from "@codemod-com/api-types";
import type { Server } from "miragejs";
import type { AppRegistry } from "..";

const isSuccess = true;
const errorExecutionResult: Result = {
  status: "error",
  message: "error msg",
};

const buildGetResponse = () => {
  const responses = [
    [
      {
        status: "progress",
        message: "progress msg 1",
        id: "1",
      },
    ],
    [
      {
        status: "progress",
        message: "progress msg 2",
      },
    ],
    [
      {
        status: "executing codemod",
        progress: { processed: 0, total: 100 },
      },
    ],
    [
      {
        status: "executing codemod",
        progress: { processed: 30, total: 100 },
      },
    ],
    [
      {
        status: "executing codemod",
        progress: { processed: 80, total: 100 },
      },
    ],
    isSuccess
      ? [
          {
            status: "done",
            link: "https://www.google.com", // PR Link
          },
        ]
      : errorExecutionResult,
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
  server.get("/run/codemodRun/status", (_, request) => {
    const nextResponse = getResponse();

    return { result: nextResponse, success: true };
  });
};
