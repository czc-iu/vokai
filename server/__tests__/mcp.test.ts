import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockQuery = vi.fn()
const mockQueryOne = vi.fn()
const mockInsert = vi.fn()
const mockRemove = vi.fn()

vi.mock('../utils/db', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  insert: (...args: unknown[]) => mockInsert(...args),
  remove: (...args: unknown[]) => mockRemove(...args)
}))

const mockClient = {
  connect: vi.fn(),
  close: vi.fn(),
  listTools: vi.fn(),
  callTool: vi.fn()
}

const mockTransport = {
  close: vi.fn()
}

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn(() => mockClient)
}))

vi.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: vi.fn(() => mockTransport)
}))

describe('MCP Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getActiveMcpServices', () => {
    it('should return active services', async () => {
      const mockServices = [
        { id: 1, name: 'service1', status: 'active' },
        { id: 2, name: 'service2', status: 'active' }
      ]
      mockQuery.mockResolvedValue(mockServices)

      const { getActiveMcpServices } = await import('../utils/mcp')
      const result = await getActiveMcpServices()

      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM mcp_services WHERE status = 'active'")
      expect(result).toEqual(mockServices)
    })

    it('should return empty array when no active services', async () => {
      mockQuery.mockResolvedValue([])

      const { getActiveMcpServices } = await import('../utils/mcp')
      const result = await getActiveMcpServices()

      expect(result).toEqual([])
    })
  })

  describe('getAllMcpServices', () => {
    it('should return all services ordered by created_at DESC', async () => {
      const mockServices = [
        { id: 2, name: 'service2', created_at: new Date('2024-01-02') },
        { id: 1, name: 'service1', created_at: new Date('2024-01-01') }
      ]
      mockQuery.mockResolvedValue(mockServices)

      const { getAllMcpServices } = await import('../utils/mcp')
      const result = await getAllMcpServices()

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM mcp_services ORDER BY created_at DESC')
      expect(result).toEqual(mockServices)
    })
  })

  describe('getMcpService', () => {
    it('should return service by id', async () => {
      const mockService = { id: 1, name: 'service1', command: 'node' }
      mockQueryOne.mockResolvedValue(mockService)

      const { getMcpService } = await import('../utils/mcp')
      const result = await getMcpService(1)

      expect(mockQueryOne).toHaveBeenCalledWith('SELECT * FROM mcp_services WHERE id = ?', [1])
      expect(result).toEqual(mockService)
    })

    it('should return null when service not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getMcpService } = await import('../utils/mcp')
      const result = await getMcpService(999)

      expect(result).toBeNull()
    })
  })

  describe('createService', () => {
    it('should create service and return insertId', async () => {
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { createService } = await import('../utils/mcp')
      const result = await createService({
        name: 'test-service',
        command: 'node',
        args: ['server.js'],
        env: { NODE_ENV: 'production' },
        description: 'Test service'
      })

      expect(mockInsert).toHaveBeenCalledWith('mcp_services', {
        name: 'test-service',
        command: 'node',
        args: JSON.stringify(['server.js']),
        env: JSON.stringify({ NODE_ENV: 'production' }),
        description: 'Test service',
        status: 'active'
      })
      expect(result).toBe(1)
    })

    it('should use default values for args and env', async () => {
      mockInsert.mockResolvedValue({ insertId: 2, affectedRows: 1 })

      const { createService } = await import('../utils/mcp')
      await createService({
        name: 'minimal-service',
        command: 'python'
      })

      expect(mockInsert).toHaveBeenCalledWith('mcp_services', {
        name: 'minimal-service',
        command: 'python',
        args: JSON.stringify([]),
        env: JSON.stringify({}),
        description: undefined,
        status: 'active'
      })
    })
  })

  describe('updateService', () => {
    it('should update service fields', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { updateService } = await import('../utils/mcp')
      const result = await updateService(1, {
        name: 'updated-service',
        command: 'new-command',
        args: ['new-arg'],
        env: { NEW_ENV: 'value' },
        status: 'inactive',
        description: 'Updated description'
      })

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE mcp_services SET ? WHERE id = ?',
        expect.arrayContaining([
          expect.objectContaining({
            name: 'updated-service',
            command: 'new-command',
            args: JSON.stringify(['new-arg']),
            env: JSON.stringify({ NEW_ENV: 'value' }),
            status: 'inactive',
            description: 'Updated description'
          }),
          1
        ])
      )
      expect(result).toBe(true)
    })

    it('should return false when no fields to update', async () => {
      const { updateService } = await import('../utils/mcp')
      const result = await updateService(1, {})

      expect(result).toBe(false)
      expect(mockQuery).not.toHaveBeenCalled()
    })

    it('should update only provided fields', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { updateService } = await import('../utils/mcp')
      await updateService(1, { status: 'error' })

      const callArgs = mockQuery.mock.calls[0][1]
      expect(callArgs[0]).toEqual({ status: 'error' })
    })

    it('should return false when no rows affected', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 0 })

      const { updateService } = await import('../utils/mcp')
      const result = await updateService(999, { name: 'nonexistent' })

      expect(result).toBe(false)
    })
  })

  describe('deleteService', () => {
    it('should delete service and return true', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 1 })

      const { deleteService } = await import('../utils/mcp')
      const result = await deleteService(1)

      expect(mockRemove).toHaveBeenCalledWith('mcp_services', 'id = ?', [1])
      expect(result).toBe(true)
    })

    it('should return false when service not found', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 0 })

      const { deleteService } = await import('../utils/mcp')
      const result = await deleteService(999)

      expect(result).toBe(false)
    })
  })

  describe('getAllTools', () => {
    it('should return all tools from active services', async () => {
      const mockServices = [
        { id: 1, name: 'service1', command: 'node', args: [], env: {} },
        { id: 2, name: 'service2', command: 'python', args: [], env: {} }
      ]
      mockQuery.mockResolvedValueOnce(mockServices)
      mockClient.connect.mockResolvedValue(undefined)
      mockClient.listTools
        .mockResolvedValueOnce({ tools: [{ name: 'tool1', description: 'Tool 1', inputSchema: { type: 'object' } }] })
        .mockResolvedValueOnce({ tools: [{ name: 'tool2', description: 'Tool 2', inputSchema: { type: 'object' } }] })

      const { getAllTools } = await import('../utils/mcp')
      const result = await getAllTools()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('service1:tool1')
      expect(result[1].name).toBe('service2:tool2')
    })

    it('should return empty array when no active services', async () => {
      mockQuery.mockResolvedValue([])

      const { getAllTools } = await import('../utils/mcp')
      const result = await getAllTools()

      expect(result).toEqual([])
    })

    it('should handle connection errors gracefully', async () => {
      const mockServices = [
        { id: 1, name: 'service1', command: 'node', args: [], env: {} }
      ]
      mockQuery.mockResolvedValueOnce(mockServices)
      mockQuery.mockResolvedValue({ affectedRows: 1 })
      mockClient.connect.mockRejectedValue(new Error('Connection failed'))

      const { getAllTools } = await import('../utils/mcp')
      const result = await getAllTools()

      expect(result).toEqual([])
    })

    it('should handle services with no tools', async () => {
      const mockServices = [
        { id: 1, name: 'service1', command: 'node', args: [], env: {} }
      ]
      mockQuery.mockResolvedValueOnce(mockServices)
      mockClient.connect.mockResolvedValue(undefined)
      mockClient.listTools.mockResolvedValue({ tools: [] })

      const { getAllTools } = await import('../utils/mcp')
      const result = await getAllTools()

      expect(result).toEqual([])
    })
  })

  describe('executeTool', () => {
    it('should execute tool and return result', async () => {
      const mockService = { id: 1, name: 'service1', command: 'node', args: [], env: {} }
      mockQueryOne.mockResolvedValue(mockService)
      mockClient.connect.mockResolvedValue(undefined)
      mockClient.listTools.mockResolvedValue({ tools: [] })
      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'Tool result' }]
      })

      const { executeTool } = await import('../utils/mcp')
      const result = await executeTool('service1:tool1', { arg1: 'value1' })

      expect(mockClient.callTool).toHaveBeenCalledWith({
        name: 'tool1',
        arguments: { arg1: 'value1' }
      })
      expect(result).toBe('Tool result')
    })

    it('should throw error for invalid tool name format', async () => {
      const { executeTool } = await import('../utils/mcp')

      await expect(executeTool('invalid-tool-name', {})).rejects.toThrow('Invalid tool name format')
    })

    it('should throw error when service not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { executeTool } = await import('../utils/mcp')

      await expect(executeTool('nonexistent:tool', {})).rejects.toThrow('MCP service not found')
    })

    it('should throw error when connection fails', async () => {
      const mockService = { id: 1, name: 'service1', command: 'node', args: [], env: {} }
      mockQueryOne.mockResolvedValue(mockService)
      mockQuery.mockResolvedValue({ affectedRows: 1 })
      mockClient.connect.mockRejectedValue(new Error('Connection failed'))

      const { executeTool } = await import('../utils/mcp')

      await expect(executeTool('service1:tool', {})).rejects.toThrow('Failed to connect to MCP service')
    })

    it('should handle tool execution failure', async () => {
      const mockService = { id: 1, name: 'service1', command: 'node', args: [], env: {} }
      mockQueryOne.mockResolvedValue(mockService)
      mockClient.connect.mockResolvedValue(undefined)
      mockClient.listTools.mockResolvedValue({ tools: [] })
      mockClient.callTool.mockRejectedValue(new Error('Execution failed'))

      const { executeTool } = await import('../utils/mcp')

      await expect(executeTool('service1:tool', {})).rejects.toThrow('Tool execution failed')
    })

    it('should handle non-text content types', async () => {
      const mockService = { id: 1, name: 'service1', command: 'node', args: [], env: {} }
      mockQueryOne.mockResolvedValue(mockService)
      mockClient.connect.mockResolvedValue(undefined)
      mockClient.listTools.mockResolvedValue({ tools: [] })
      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'image', data: 'base64data' }]
      })

      const { executeTool } = await import('../utils/mcp')
      const result = await executeTool('service1:tool', {})

      expect(result).toContain('base64data')
    })

    it('should handle multiple content items', async () => {
      const mockService = { id: 1, name: 'service1', command: 'node', args: [], env: {} }
      mockQueryOne.mockResolvedValue(mockService)
      mockClient.connect.mockResolvedValue(undefined)
      mockClient.listTools.mockResolvedValue({ tools: [] })
      mockClient.callTool.mockResolvedValue({
        content: [
          { type: 'text', text: 'Result 1' },
          { type: 'text', text: 'Result 2' }
        ]
      })

      const { executeTool } = await import('../utils/mcp')
      const result = await executeTool('service1:tool', {})

      expect(result).toBe('Result 1\nResult 2')
    })

    it('should handle result without content array', async () => {
      const mockService = { id: 1, name: 'service1', command: 'node', args: [], env: {} }
      mockQueryOne.mockResolvedValue(mockService)
      mockClient.connect.mockResolvedValue(undefined)
      mockClient.listTools.mockResolvedValue({ tools: [] })
      mockClient.callTool.mockResolvedValue({ status: 'ok' })

      const { executeTool } = await import('../utils/mcp')
      const result = await executeTool('service1:tool', {})

      expect(result).toBe(JSON.stringify({ status: 'ok' }))
    })
  })

  describe('disconnectService', () => {
    it('should disconnect and remove client from activeClients', async () => {
      const mockService = { id: 1, name: 'service1', command: 'node', args: [], env: {} }
      mockQuery.mockResolvedValue([mockService])
      mockClient.connect.mockResolvedValue(undefined)
      mockClient.listTools.mockResolvedValue({ tools: [] })

      const { getAllTools, disconnectService } = await import('../utils/mcp')
      await getAllTools()
      await disconnectService('service1')

      expect(mockClient.close).toHaveBeenCalled()
    })

    it('should do nothing when service not connected', async () => {
      const { disconnectService } = await import('../utils/mcp')
      await disconnectService('nonexistent')

      expect(mockClient.close).not.toHaveBeenCalled()
    })
  })

  describe('convertToolsToOpenAIFormat', () => {
    it('should convert MCP tools to OpenAI format', async () => {
      const { convertToolsToOpenAIFormat } = await import('../utils/mcp')
      const tools = [
        {
          name: 'test-tool',
          description: 'Test description',
          inputSchema: { type: 'object' as const, properties: { arg1: { type: 'string' } } }
        }
      ]

      const result = convertToolsToOpenAIFormat(tools)

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('function')
      expect(result[0].function.name).toBe('test-tool')
      expect(result[0].function.description).toBe('Test description')
      expect(result[0].function.parameters).toEqual(tools[0].inputSchema)
    })

    it('should use default description when not provided', async () => {
      const { convertToolsToOpenAIFormat } = await import('../utils/mcp')
      const tools = [
        {
          name: 'no-desc-tool',
          inputSchema: { type: 'object' as const }
        }
      ]

      const result = convertToolsToOpenAIFormat(tools)

      expect(result[0].function.description).toBe('MCP tool: no-desc-tool')
    })

    it('should handle empty tools array', async () => {
      const { convertToolsToOpenAIFormat } = await import('../utils/mcp')
      const result = convertToolsToOpenAIFormat([])

      expect(result).toEqual([])
    })

    it('should handle tools with required fields', async () => {
      const { convertToolsToOpenAIFormat } = await import('../utils/mcp')
      const tools = [
        {
          name: 'required-tool',
          description: 'Has required fields',
          inputSchema: {
            type: 'object' as const,
            properties: { arg1: { type: 'string' } },
            required: ['arg1']
          }
        }
      ]

      const result = convertToolsToOpenAIFormat(tools)

      expect(result[0].function.parameters.required).toEqual(['arg1'])
    })
  })
})
