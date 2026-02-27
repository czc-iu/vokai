import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { query, queryOne, insert, update, remove } from './db'

export interface MCPTool {
  name: string
  description?: string
  inputSchema: {
    type: 'object'
    properties?: Record<string, unknown>
    required?: string[]
  }
}

export interface MCPService {
  id: number
  name: string
  command: string
  args: string[]
  env: Record<string, string>
  status: 'active' | 'inactive' | 'error'
  description?: string
}

interface MCPClientInfo {
  client: Client
  transport: StdioClientTransport
  tools: MCPTool[]
}

interface ToolResultContent {
  type: string
  text?: string
  [key: string]: unknown
}

interface ToolResult {
  content?: ToolResultContent[]
  [key: string]: unknown
}

const activeClients = new Map<string, MCPClientInfo>()

export async function getActiveMcpServices(): Promise<MCPService[]> {
  return query<MCPService[]>(
    "SELECT * FROM mcp_services WHERE status = 'active'"
  )
}

export async function getAllMcpServices(): Promise<MCPService[]> {
  return query<MCPService[]>('SELECT * FROM mcp_services ORDER BY created_at DESC')
}

export async function getMcpService(id: number): Promise<MCPService | null> {
  return queryOne<MCPService>('SELECT * FROM mcp_services WHERE id = ?', [id])
}

export async function createMcpService(data: {
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
  description?: string
}): Promise<number> {
  const result = await insert('mcp_services', {
    name: data.name,
    command: data.command,
    args: JSON.stringify(data.args || []),
    env: JSON.stringify(data.env || {}),
    description: data.description,
    status: 'active'
  })
  return result.insertId
}

export async function updateMcpService(
  id: number,
  data: Partial<{
    name: string
    command: string
    args: string[]
    env: Record<string, string>
    status: 'active' | 'inactive' | 'error'
    description: string
  }>
): Promise<boolean> {
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.command !== undefined) updateData.command = data.command
  if (data.args !== undefined) updateData.args = JSON.stringify(data.args)
  if (data.env !== undefined) updateData.env = JSON.stringify(data.env)
  if (data.status !== undefined) updateData.status = data.status
  if (data.description !== undefined) updateData.description = data.description

  if (Object.keys(updateData).length === 0) return false

  const result = await update('mcp_services', updateData, 'id = ?', [id])
  return result.affectedRows > 0
}

export async function deleteMcpService(id: number): Promise<boolean> {
  const result = await remove('mcp_services', 'id = ?', [id])
  return result.affectedRows > 0
}

function createTransport(service: MCPService): StdioClientTransport {
  return new StdioClientTransport({
    command: service.command,
    args: service.args || [],
    env: {
      ...process.env,
      ...service.env
    } as Record<string, string>
  })
}

function createClient(serviceName: string): Client {
  return new Client(
    { name: `tomybot-mcp-${serviceName}`, version: '1.0.0' },
    { capabilities: {} }
  )
}

async function fetchTools(client: Client, serviceName: string): Promise<MCPTool[]> {
  const toolsResult = await client.listTools()
  return (toolsResult.tools || []).map((t) => ({
    name: `${serviceName}:${t.name}`,
    description: t.description,
    inputSchema: t.inputSchema as MCPTool['inputSchema']
  }))
}

async function connectService(service: MCPService): Promise<MCPClientInfo | null> {
  const existing = activeClients.get(service.name)
  if (existing) return existing

  try {
    const transport = createTransport(service)
    const client = createClient(service.name)
    await client.connect(transport)
    const tools = await fetchTools(client, service.name)

    const clientInfo: MCPClientInfo = { client, transport, tools }
    activeClients.set(service.name, clientInfo)

    return clientInfo
  } catch (error) {
    console.error(`Failed to connect MCP service ${service.name}:`, error)
    await updateMcpService(service.id, { status: 'error' })
    return null
  }
}

export async function disconnectService(name: string): Promise<void> {
  const clientInfo = activeClients.get(name)
  if (clientInfo) {
    await clientInfo.client.close()
    activeClients.delete(name)
  }
}

export async function getAllTools(): Promise<MCPTool[]> {
  const services = await getActiveMcpServices()
  const allTools: MCPTool[] = []

  for (const service of services) {
    const clientInfo = await connectService(service)
    if (clientInfo) {
      allTools.push(...clientInfo.tools)
    }
  }

  return allTools
}

function parseToolName(toolName: string): { serviceName: string; toolName: string } | null {
  const parts = toolName.split(':')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null
  }
  return { serviceName: parts[0], toolName: parts[1] }
}

function formatToolResult(result: ToolResult): string {
  if (result.content && Array.isArray(result.content)) {
    return result.content
      .map((c) => (c.type === 'text' && c.text ? c.text : JSON.stringify(c)))
      .join('\n')
  }
  return JSON.stringify(result)
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  const parsed = parseToolName(toolName)
  if (!parsed) {
    throw new Error(`Invalid tool name format: ${toolName}`)
  }

  const service = await queryOne<MCPService>(
    "SELECT * FROM mcp_services WHERE name = ? AND status = 'active'",
    [parsed.serviceName]
  )

  if (!service) {
    throw new Error(`MCP service not found: ${parsed.serviceName}`)
  }

  const clientInfo = await connectService(service)
  if (!clientInfo) {
    throw new Error(`Failed to connect to MCP service: ${parsed.serviceName}`)
  }

  try {
    const result = await clientInfo.client.callTool({
      name: parsed.toolName,
      arguments: args
    })
    return formatToolResult(result)
  } catch (error) {
    throw new Error(
      `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export function convertToolsToOpenAIFormat(tools: MCPTool[]): Array<{
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}> {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description || `MCP tool: ${tool.name}`,
      parameters: tool.inputSchema
    }
  }))
}
