import mysql from 'mysql2/promise'
import type { RowDataPacket, OkPacket } from 'mysql2'

let pool: mysql.Pool | null = null

function createPoolConfig(): mysql.PoolOptions {
  const config = useRuntimeConfig()
  return {
    host: config.dbHost,
    port: config.dbPort,
    database: config.dbName,
    user: config.dbUser,
    password: config.dbPassword,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(createPoolConfig())
  }
  return pool
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

export async function query<T = RowDataPacket[]>(sql: string, params: unknown[] = []): Promise<T> {
  const connection = getPool()
  const [rows] = await connection.execute(sql, params as [])
  return rows as T
}

export async function queryOne<T = RowDataPacket>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T[]>(sql, params)
  return rows[0] ?? null
}

export async function insert(table: string, data: Record<string, unknown>): Promise<{ insertId: number; affectedRows: number }> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map(() => '?').join(', ')
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
  
  const result = await query<OkPacket>(sql, values)
  return {
    insertId: result.insertId,
    affectedRows: result.affectedRows
  }
}

export async function update(
  table: string, 
  data: Record<string, unknown>, 
  whereClause: string, 
  whereParams: unknown[]
): Promise<{ affectedRows: number }> {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClause = keys.map(k => `${k} = ?`).join(', ')
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`
  
  const result = await query<OkPacket>(sql, [...values, ...whereParams])
  return { affectedRows: result.affectedRows }
}

export async function remove(
  table: string, 
  whereClause: string, 
  whereParams: unknown[]
): Promise<{ affectedRows: number }> {
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`
  const result = await query<OkPacket>(sql, whereParams)
  return { affectedRows: result.affectedRows }
}
