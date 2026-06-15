import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const initDB = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,

        name VARCHAR(100) NOT NULL
          CHECK (CHAR_LENGTH(TRIM(name)) > 0),

        email VARCHAR(255) NOT NULL UNIQUE,

        password TEXT NOT NULL,

        role VARCHAR(20) NOT NULL DEFAULT 'contributor'
          CHECK (role IN ('contributor', 'maintainer')),

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,

        title VARCHAR(150) NOT NULL
          CHECK (
            CHAR_LENGTH(TRIM(title)) > 0
            AND CHAR_LENGTH(title) <= 150
          ),

        description TEXT NOT NULL
          CHECK (CHAR_LENGTH(TRIM(description)) >= 20),

        type VARCHAR(30) NOT NULL
          CHECK (type IN ('bug', 'feature_request')),

        status VARCHAR(20) NOT NULL DEFAULT 'open'
          CHECK (status IN ('open', 'in_progress', 'resolved')),

        reporter_id INTEGER NOT NULL,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS users_updated_at_trigger
      ON users
    `);

    await pool.query(`
      CREATE TRIGGER users_updated_at_trigger
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS issues_updated_at_trigger
      ON issues
    `);

    await pool.query(`
      CREATE TRIGGER issues_updated_at_trigger
      BEFORE UPDATE ON issues
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_reporter_id
      ON issues(reporter_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_created_at
      ON issues(created_at)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_type
      ON issues(type)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_status
      ON issues(status)
    `);

    const connectionTest = await pool.query<{
      database_name: string;
      current_time: Date;
    }>(`
      SELECT
        current_database() AS database_name,
        NOW() AS current_time
    `);

    console.log("Database connected successfully!");
    console.log(
      `Connected database: ${connectionTest.rows[0]?.database_name}`,
    );
    console.log("Users and issues tables initialized successfully!");
  } catch (error: unknown) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};