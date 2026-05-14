import { Router } from "express";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";
import { DailyTaskService } from "../services/DailyTaskService";
import db from "../database";

const router = Router();

// Bugünün görevlerini getir (yoksa oluştur)
router.get("/today", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await DailyTaskService.ensureTasksForToday(req.userId!);
    const today = new Date().toISOString().slice(0, 10);
    const tasks = await db("daily_tasks")
      .where({ user_id: req.userId, date: today })
      .orderBy("is_completed", "asc")
      .orderBy("created_at", "asc");
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

export default router;
