import { Router } from "express";
import authRoutes from "./v1/auth.js";
import taskRoutes from "./v1/tasks.js";
import adminRoutes from "./v1/admin.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/admin", adminRoutes);

export default router;
