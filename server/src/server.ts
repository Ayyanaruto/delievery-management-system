if (process.env.NODE_ENV === "production") {
  require("module-alias/register");
}
import cors from "cors";
import express from "express";

import config from "./config/config";
import { Database } from "./lib/connection";
import logger from "./lib/logger";

import { errorHandler } from "./middleware/errorHandler";
import { morganMiddleware } from "./middleware/morganMiddleware";

import { authRoutes } from "./api/v1/auth/auth.router";

const app = express();
const base = config.api.base
const version = config.api.version
const port = config.node.port || "3000";
app.use(cors())
app.use(express.json());
app.use(morganMiddleware);

const startServer = async () => {
  await Database.connect();
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`, {
      service: "api-server",
      port,
      environment: config.node.environment || "development",
    });
  });
};

app.get("/", (_req, res) => {
  res.send("Rentkar Delivery Management API");
});
app.use(`${base}${version}/auth`, authRoutes);

app.use(errorHandler);
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
