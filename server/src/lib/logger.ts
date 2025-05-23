import winston from "winston";
import path from "path";


class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    const { combine, timestamp, printf, colorize, json } = winston.format;

    const consoleFormat = printf(
      ({ level, message, timestamp, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;

        if (Object.keys(metadata).length > 0 && metadata.stack === undefined) {
          msg += ` ${JSON.stringify(metadata)}`;
        } else if (metadata.stack) {
          msg += `\n${metadata.stack}`;
        }

        return msg;
      }
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      defaultMeta: { service: "api-server" },
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
      transports: [
        new winston.transports.Console({
          format: combine(
            colorize(),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            consoleFormat
          ),
        }),
      ],
      exitOnError: false,
    });

    if (process.env.NODE_ENV === "production") {
      const logDir = "logs";
      require("fs").mkdirSync(logDir, { recursive: true });

      this.logger.add(
        new winston.transports.File({
          filename: path.join(logDir, "error.log"),
          level: "error",
          format: combine(timestamp(), json()),
          maxsize: 10485760,
          maxFiles: 10,
        })
      );

      this.logger.add(
        new winston.transports.File({
          filename: path.join(logDir, "combined.log"),
          format: combine(timestamp(), json()),
          maxsize: 10485760,
          maxFiles: 5,
        })
      );
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public error(message: string | Error, meta?: any): void {
    if (message instanceof Error) {
      const { message: msg, name, stack } = message;
      this.logger.error(msg, { ...meta, name, stack });
    } else {
      this.logger.error(message, meta);
    }
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public setLogLevel(level: string): void {
    this.logger.level = level;
  }
}


export default Logger.getInstance();
