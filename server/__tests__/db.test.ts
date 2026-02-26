import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import mysql from 'mysql2/promise'

const mockPool = {
  execute: vi.fn(),
  end: vi.fn()
}

vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn(() => mockPool)
  }
}))

const mockConfig = {
  dbHost: 'localhost',
  dbPort: 3306,
  dbName: 'tomybot_test',
  dbUser: 'test',
  dbPassword: 'test123'
}

vi.stubGlobal('useRuntimeConfig', () => mockConfig)

describe('Database Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getPool', () => {
    it('should create a connection pool with correct config', async () => {
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { getPool } = await import('../utils/db')
      const pool = getPool()

      expect(mysql.createPool).toHaveBeenCalledWith({
        host: 'localhost',
        port: 3306,
        database: 'tomybot_test',
        user: 'test',
        password: 'test123',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      })
      expect(pool).toBe(mockPool)
    })

    it('should return the same pool instance on subsequent calls', async () => {
      vi.mocked(mysql.createPool).mockClear()
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { getPool } = await import('../utils/db')
      getPool()
      getPool()

      expect(mysql.createPool).toHaveBeenCalledTimes(0)
    })
  })

  describe('closePool', () => {
    it('should close the pool connection', async () => {
      mockPool.end.mockResolvedValue(undefined)
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { closePool } = await import('../utils/db')
      await closePool()

      expect(mockPool.end).toHaveBeenCalled()
    })
  })

  describe('query', () => {
    it('should execute query and return rows', async () => {
      const mockRows = [{ id: 1, name: 'test' }]
      mockPool.execute.mockResolvedValue([mockRows, []])
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { query } = await import('../utils/db')
      const result = await query('SELECT * FROM users WHERE id = ?', [1])

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1])
      expect(result).toEqual(mockRows)
    })

    it('should handle query without params', async () => {
      const mockRows = [{ id: 1 }, { id: 2 }]
      mockPool.execute.mockResolvedValue([mockRows, []])
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { query } = await import('../utils/db')
      const result = await query('SELECT * FROM users')

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM users', [])
      expect(result).toEqual(mockRows)
    })

    it('should throw error on query failure', async () => {
      const error = new Error('Query failed')
      mockPool.execute.mockRejectedValue(error)
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { query } = await import('../utils/db')

      await expect(query('SELECT * FROM nonexist')).rejects.toThrow('Query failed')
    })
  })

  describe('queryOne', () => {
    it('should return first row from result', async () => {
      const mockRows = [{ id: 1, name: 'test' }]
      mockPool.execute.mockResolvedValue([mockRows, []])
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { queryOne } = await import('../utils/db')
      const result = await queryOne('SELECT * FROM users WHERE id = ?', [1])

      expect(result).toEqual(mockRows[0])
    })

    it('should return null for empty result', async () => {
      mockPool.execute.mockResolvedValue([[], []])
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { queryOne } = await import('../utils/db')
      const result = await queryOne('SELECT * FROM users WHERE id = ?', [999])

      expect(result).toBeNull()
    })
  })

  describe('insert', () => {
    it('should insert data and return insertId', async () => {
      const mockResult = { insertId: 42, affectedRows: 1 }
      mockPool.execute.mockResolvedValue([mockResult, []])
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { insert } = await import('../utils/db')
      const result = await insert('users', { email: 'test@example.com', name: 'Test' })

      expect(mockPool.execute).toHaveBeenCalledWith(
        'INSERT INTO users (email, name) VALUES (?, ?)',
        ['test@example.com', 'Test']
      )
      expect(result.insertId).toBe(42)
      expect(result.affectedRows).toBe(1)
    })

    it('should handle single column insert', async () => {
      const mockResult = { insertId: 1, affectedRows: 1 }
      mockPool.execute.mockResolvedValue([mockResult, []])
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { insert } = await import('../utils/db')
      const result = await insert('contacts', { message: 'Hello' })

      expect(mockPool.execute).toHaveBeenCalledWith(
        'INSERT INTO contacts (message) VALUES (?)',
        ['Hello']
      )
      expect(result.insertId).toBe(1)
    })
  })

  describe('update', () => {
    it('should update data with where clause', async () => {
      const mockResult = { affectedRows: 2 }
      mockPool.execute.mockResolvedValue([mockResult, []])
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { update } = await import('../utils/db')
      const result = await update('users', { name: 'New Name' }, 'id = ?', [1])

      expect(mockPool.execute).toHaveBeenCalledWith(
        'UPDATE users SET name = ? WHERE id = ?',
        ['New Name', 1]
      )
      expect(result.affectedRows).toBe(2)
    })

    it('should update multiple columns', async () => {
      const mockResult = { affectedRows: 1 }
      mockPool.execute.mockResolvedValue([mockResult, []])
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { update } = await import('../utils/db')
      const result = await update(
        'users',
        { name: 'New', email: 'new@example.com' },
        'id = ?',
        [1]
      )

      expect(mockPool.execute).toHaveBeenCalledWith(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        ['New', 'new@example.com', 1]
      )
      expect(result.affectedRows).toBe(1)
    })

    it('should return zero affectedRows when no rows match', async () => {
      const mockResult = { affectedRows: 0 }
      mockPool.execute.mockResolvedValue([mockResult, []])
      vi.mocked(mysql.createPool).mockReturnValue(mockPool as unknown as mysql.Pool)

      const { update } = await import('../utils/db')
      const result = await update('users', { name: 'New' }, 'id = ?', [999])

      expect(result.affectedRows).toBe(0)
    })
  })
})
