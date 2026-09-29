import { Router } from "express";
import healthRouter from "./health.js";
import articlesRouter from "./articles.js";
import categoriesRouter from "./categories.js";
import breakingRouter from "./breaking.js";
import mediaRouter from "./media.js";
import adminRouter from "./admin.js";
import editionsRouter from "./editions.js";
import settingsRouter from "./settings.js";
import adsRouter from "./ads.js";
import notificationsRouter from "./notifications.js";
import metaRouter from "./meta.js";

const router = Router();

router.use(healthRouter);
router.use(notificationsRouter);
router.use("/meta", metaRouter);
router.use(editionsRouter);
router.use(articlesRouter);
router.use(categoriesRouter);
router.use(breakingRouter);
router.use(mediaRouter);
router.use(adminRouter);
router.use(settingsRouter);
router.use(adsRouter);

export default router;
