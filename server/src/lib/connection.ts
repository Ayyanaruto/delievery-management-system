import mongoose from "mongoose";
import logger from "./logger";
import config from "@/config/config";

export class Database {
  private static isConnected = false;

  public static async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const uri =
        config.mongodb.uri || "mongodb://localhost:27017/rentkar";
      await mongoose.connect(uri, {});
      this.isConnected = true;
      logger.info("MongoDB connected 💾", {
        service: "database-connection",
        uri,
      });

      mongoose.connection.on("error", (err) => {
        logger.error("MongoDB connection error:", {
          ...err,
          service: "database-connection",
          uri,
        });
      });

      mongoose.connection.on("disconnected", () => {
        logger.info("MongoDB disconnected");
        this.isConnected = false;
      });
    } catch (error) {
      this.isConnected;
      logger.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }
}
