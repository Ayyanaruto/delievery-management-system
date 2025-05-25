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

import authRoutes from "./api/v1/auth/auth.routes";
import orderRoutes from "./api/v1/orders/orders.routes";
import partnerRoutes from "./api/v1/partners/partner.routes";

const app = express();
const base = config.api.base
const version = config.api.version
const port = config.node.port || "3000";

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4173",
      "http://localhost:5000",
      "https://delivery-management-system.onrender.com",
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
app.use(`${base}${version}/partners`, partnerRoutes)
app.use(`${base}${version}/orders`, orderRoutes)

app.use(errorHandler);
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
