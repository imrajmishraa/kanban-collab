import mongoose from "mongoose";
import { logger } from '../../logging/logger';
import { DB_NAME } from "../../../shared/constants/constants";
import { ENV } from "../../../config/env";


export async function connectDB(): Promise<typeof mongoose> {
  logger.info(`Connecting to MongoDB at: ${ENV.MONGODB_URI}`);

  try {
    const conn = await mongoose.connect(
      `${ENV.MONGODB_URI}`,
      {
        dbName: DB_NAME,
        maxPoolSize: 100,
        minPoolSize: 10,
        socketTimeoutMS: 45000,
     }
    );
    logger.info('Successfully connected to MongoDB.');
    console.log(
      `✅ MongoDB connected successfully! DB_HOST = ${conn.connection.host}`,
    );
    return conn;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:');
    console.log(`⁉️⚠️ MongoDB connection error`, error);
    process.exit(1);
  }
}

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  logger.info("MongoDB disconnected.");
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB connection reestablished.');
});

export default connectDB;
