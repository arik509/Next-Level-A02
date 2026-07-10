import app from "../app";
import { initDB, pool } from "../db";

let dbReady: Promise<void> | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!dbReady) {
      dbReady = initDB();
    }
    await dbReady;

    return (app as any)(req, res);
  } catch (error: unknown) {
    console.error("Failed to initialize database:", error);
    await pool.end();
    res.status(500).json({
      success: false,
      message: "Server initialization failed",
    });
  }
}