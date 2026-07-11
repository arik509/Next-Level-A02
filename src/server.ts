import app from "./app";
// import { initDB } from "./db";

// // Initialize database once on cold start
// let dbInitialized = false;

// const initializeDB = async (): Promise<void> => {
//   if (dbInitialized) return;
//   try {
//     await initDB();
//     dbInitialized = true;
//   } catch (error: unknown) {
//     console.error("Failed to initialize database:", error);
//     throw error;
//   }
// };

// // For local development
// if (process.env.NODE_ENV !== "production") {
//   const startLocalServer = async (): Promise<void> => {
//     try {
//       await initializeDB();
//       const config = (await import("./config")).default;
//       app.listen(config.port, () => {
//         console.log(`DevPulse server is running on port ${config.port}`);
//       });
//     } catch (error: unknown) {
//       console.error("Failed to start the application:", error);
//       process.exit(1);
//     }
//   };
//   void startLocalServer();
// }

// // Export for Vercel serverless
export default app;