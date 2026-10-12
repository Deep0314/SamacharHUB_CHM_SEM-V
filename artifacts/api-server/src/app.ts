import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { connectMongoDB } from "./lib/mongodb.js";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Ensure MongoDB is connected on every request (crucial for Vercel Serverless)
app.use(async (_req, _res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (err) {
    logger.error({ err }, "Database connection middleware error");
    next(); // Continue anyway, routes that need DB will handle their own errors
  }
});

connectMongoDB().catch((err: unknown) => {
  logger.error({ err }, "Failed to connect to MongoDB - check MONGODB_URI and Atlas IP whitelist");
});

app.get("/", (_req, res) => {
  res.send("SamacharHUB API Server is Running!");
});

app.use("/api", router);

export default app;
