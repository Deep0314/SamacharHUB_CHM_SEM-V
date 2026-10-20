import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
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

// Ensure MongoDB is connected on every request (crucial for Vercel Serverless & cloud restarts)
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

// API Routes
app.use("/api", router);

// Serve frontend static build in production if available
const possibleStaticDirs = [
  path.resolve(process.cwd(), "artifacts/enewspaper/dist/public"),
  path.resolve(process.cwd(), "../enewspaper/dist/public"),
];

const staticDir = possibleStaticDirs.find((dir) => fs.existsSync(dir));

if (staticDir) {
  logger.info({ staticDir }, "Serving static frontend files");
  app.use(express.static(staticDir));
  app.use((req: Request, res: Response, next: any) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(staticDir, "index.html"));
    }
    next();
  });
} else {
  app.get("/", (_req, res) => {
    res.send("SamacharHUB API Server is Running!");
  });
}

export default app;
