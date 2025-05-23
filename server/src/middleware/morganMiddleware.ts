import morgan from "morgan";
import { Request, Response } from "express";

import logger from "@/lib/logger";
import { ConsoleColor, ElementColor, MethodColor, StatusColor } from "@/constants/constant";



const morganMiddleware = morgan(
  (tokens: any, req: Request, res: Response) => {
    const status = parseInt(tokens.status(req, res) || "0");
    const method = tokens.method(req, res)?.toLowerCase() || "";

    let statusColor =
      status >= 500
        ? StatusColor.SERVER_ERROR
        : status >= 400
        ? StatusColor.CLIENT_ERROR
        : status >= 300
        ? StatusColor.REDIRECT
        : StatusColor.SUCCESS;

    let methodColor =
      method === "get"
        ? MethodColor.GET
        : method === "post"
        ? MethodColor.POST
        : method === "put"
        ? MethodColor.PUT
        : method === "delete"
        ? MethodColor.DELETE
        : ConsoleColor.RESET;

    return [
      methodColor + tokens.method(req, res) + ConsoleColor.RESET,
      ElementColor.URL + tokens.url(req, res) + ConsoleColor.RESET,
      statusColor + tokens.status(req, res) + ConsoleColor.RESET,
      "-",
      ElementColor.TIME +
        tokens["response-time"](req, res) +
        ConsoleColor.RESET,
      "ms",
      "-",
      ElementColor.SIZE + "Content-Length:",
      tokens.res(req, res, "content-length") || 0 + ConsoleColor.RESET,
    ].join(" ");
  },
  {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }
);

export { morganMiddleware };
