import express from "express";
import { ENV } from "./config/env";
import { connectDB } from "./infrastructure/db/dbConnect";
import mongoose from "mongoose";
const app = express();

async function startServer() {
  try {
    // Verify database connection
    await connectDB().catch((err) => {
      console.log("⁉️MongoDB connection error", err);
    });

    console.log("✅ Connected to MongoDB");

    const server = app.listen(ENV.PORT, () => {
      console.log(`🚀Server running on ${ENV.PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("⏳Stopping server...");
      await mongoose.disconnect();
      console.log("⚠️Database disconnected!");

      server.close(async () => {
        console.log("⌛️Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startServer();

// connection checkup
app.get("/", (req, res) => {
  res.send("Hello");
});

// import routes
import healthzRouter from "./interfaces/http/routes/healthz/healthz.route";

// managed routes
app.use("/api/v1/", healthzRouter);

// Error Middleware (Must be last)
import { errorHandler } from "./interfaces/http/middleware/errors";
app.use(errorHandler);

export { app };
