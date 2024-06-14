import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import pino from "pino";
import pretty from "pino-pretty";

import fp from "fastify-plugin";

const formatTimestamp = (timestamp: number) =>
  new Date(timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const plugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  const stream = pretty({
    singleLine: true,
    ignore: "pid,hostname,name,time,level",
    errorLikeObjectKeys: ["error", "err"],
    messageFormat: (log, _messageKey, _levelLabel, { colors }): string => {
      const logLevel = {
        10: "TRACE",
        20: "DEBUG",
        30: "INFO",
        40: "WARN",
        50: "ERROR",
        60: "FATAL",
      };

      const level = String(log.level);
      const time = Number(log.time);
      const name = String(log.name);
      const msg = String(log.msg);

      const formattedTime = formatTimestamp(time);
      const colorizedTime = colors.gray(formattedTime);

      const formattedLevel = logLevel[level] ?? "INFO";
      const colorizedLevel = {
        10: colors.gray(formattedLevel),
        20: colors.cyan(formattedLevel),
        30: colors.green(formattedLevel),
        40: colors.yellow(formattedLevel),
        50: colors.bold(colors.redBright(formattedLevel)),
        60: colors.bold(colors.bgRed(formattedLevel)),
      }[level];

      const colorizedMsg =
        {
          10: colors.gray(msg),
          20: colors.white(msg),
          30: colors.white(msg),
          40: colors.yellow(msg),
          50: colors.bold(colors.redBright(msg)),
          60: colors.bold(colors.bgRed(msg)),
        }[level] ?? colors.white(msg);

      const colorizedServiceName = colors.whiteBright(name);

      const colorizedOpenBracket = colors.blackBright("[");
      const colorizedCloseBracket = colors.blackBright("]");

      const colorizedDot = colors.blackBright("•");
      const colorizedArrow = colors.blackBright("➜");

      return `${colorizedOpenBracket}${colorizedLevel}${colorizedCloseBracket} ${colorizedDot} ${colorizedTime} ${colorizedDot} ${colorizedOpenBracket}${colorizedServiceName}${colorizedCloseBracket} ${colorizedArrow} ${colorizedMsg}`;
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
