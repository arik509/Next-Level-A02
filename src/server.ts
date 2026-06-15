import app from "./app";
import config from "./config";
import { initDB, pool } from "./db";

const main = async (): Promise<void> => {
  try {
    await initDB();

    app.listen(config.port, () => {
      console.log(`DevPulse server is running on port ${config.port}`);
    });
  } catch (error: unknown) {
    console.error("Failed to start the application:", error);

    await pool.end();
    process.exit(1);
  }
};

void main();