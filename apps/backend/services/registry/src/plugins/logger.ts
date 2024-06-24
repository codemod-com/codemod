import pino, { type LogDescriptor } from "pino";
import pretty from "pino-pretty";

import * as colors from "colorette";

import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const getLogLevel = (log: LogDescriptor): string => {
  const level = Number(log.level);

  return (
    {
      10: colors.gray("TRACE"),
      20: colors.cyan("DEBUG"),
      30: colors.green("INFO"),
      40: colors.yellow("WARN"),
      50: colors.bold(colors.redBright("ERROR")),
      60: colors.bold(colors.bgRed("FATAL")),
    }[level] ?? colors.cyanBright("UNKNOWN STATUS")
  );
};

const getLogServiceName = (log: LogDescriptor): string => {
  const name = String(log.name);

  return colors.whiteBright(name);
};

const getLogTimestamp = (log: LogDescriptor): string => {
  const timestamp = Number(log.time);

  return colors.gray(
    new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  );
};

const getLogMessage = (log: LogDescriptor): string => {
  const level = Number(log.level);
  const message = String(log.msg);

  return (
    {
      10: colors.gray(message),
      20: colors.white(message),
      30: colors.white(message),
      40: colors.yellow(message),
      50: colors.bold(colors.redBright(message)),
      60: colors.bold(colors.bgRed(message)),
    }[level] ?? colors.cyanBright("UNKNOWN MESSAGE")
  );
};

const createFormattedLog = (
  level: string,
  timestamp: string,
  name: string,
  message: string,
) => {
  const ob = colors.blackBright("[");
  const cb = colors.blackBright("]");
  const dot = colors.blackBright("•");
  const arrow = colors.blackBright("➜");

  return `${ob}${level}${cb} ${dot} ${timestamp} ${dot} ${ob}${name}${cb} ${arrow} ${message}`;
};

const plugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  const stream = pretty({
    singleLine: true,
    ignore: "pid,hostname,name,time,level",
    errorLikeObjectKeys: ["error", "err"],
    messageFormat: (log: LogDescriptor): string => {
      const level = getLogLevel(log);
      const timestamp = getLogTimestamp(log);
      const name = getLogServiceName(log);
      const message = getLogMessage(log);

      const formattedLog = createFormattedLog(level, timestamp, name, message);

      return formattedLog;
    },
  });

  const logger = pino({ name: server.name }, stream);

  server.addHook("onRequest", (request, _reply, done) => {
    server.log.info(`HTTP ← ${request.method} ${request.url} • ${request.ip} `);
    done();
  });

  server.addHook("onResponse", (_request, reply, done) => {
    const statusCode = reply.statusCode;
    if (statusCode >= 100 && statusCode < 400) {
      server.log.info(`HTTP → ${statusCode}`);
    } else if (statusCode >= 400 && statusCode < 600) {
      server.log.error(`HTTP → ${statusCode}`);
    } else {
      server.log.warn(`HTTP → ${statusCode}`);
    }
    done();
  });

  server.log = logger;
};

export const logger = fp(plugin);
