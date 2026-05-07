import mysql from "mysql2/promise";

// Reuse pool across serverless invocations via global cache
const globalPool = globalThis._mysqlPool || mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "shringar_nepal",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
  ...(process.env.DB_SSL === "true" && {
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  }),
});

if (process.env.NODE_ENV !== "production") {
  globalThis._mysqlPool = globalPool;
}

const pool = globalPool;

export async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

export async function getConnection() {
  return await pool.getConnection();
}

export default pool;
