import { Router, Request, Response } from "express";
import pool from "../db";
import fs from "fs";
import path from "path";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const migrationPath = path.join(__dirname, "../../migrations/001_init.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");
    
    const client = await pool!.connect();
    await client.query(sql);
    client.release();
    
    res.json({ status: "success", message: "Database migrated successfully!" });
  } catch (err: any) {
    console.error("Migration error:", err);
    res.status(500).json({ error: "Migration failed: " + err.message });
  }
});

export default router;
