# AGENTS.md

## Build, Lint, and Test Commands

### Project Type
Nuxt 3 full-stack application with MySQL database and Vectra vector store.

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production build
npm run build

# Preview production build
npm run preview
```

### Database Setup
```bash
# Initialize MySQL database
mysql -u root -p < database/init.sql
```

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Testing
```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Linting & Type Checking
```bash
# Run ESLint
npm run lint

# Run TypeScript type check
npm run typecheck
```

---

## Project Structure

```
Tomybot/
├── app/                          # Nuxt application
│   ├── assets/css/               # Global styles (main.css)
│   ├── components/               # Vue components
│   │   └── ChatMessage.vue       # Chat message with Markdown rendering
│   ├── composables/              # Vue composables
│   │   └── useAuth.ts            # Auth state management
│   ├── layouts/                  # Layout components
│   │   └── default.vue           # Main layout with nav/footer
│   ├── middleware/               # Route middleware
│   │   └── auth.ts               # Auth guard (requireAuth)
│   ├── pages/                    # Page components
│   │   ├── index.vue             # Homepage
│   │   ├── login.vue             # Login page
│   │   ├── register.vue          # Registration page
│   │   ├── chat.vue              # AI chat interface (streaming + markdown)
│   │   ├── contact.vue           # Contact form
│   │   └── coming-soon.vue       # Placeholder page
│   ├── __tests__/                # App tests
│   │   └── useAuth.test.ts       # Auth composable tests
│   └── app.vue                   # Root component
│
├── server/                       # Server-side code
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── register.post.ts
│   │   │   ├── login.post.ts
│   │   │   └── me.get.ts
│   │   ├── chat/                 # Chat endpoints
│   │   │   ├── index.post.ts     # Standard chat
│   │   │   ├── stream.post.ts    # SSE streaming chat
│   │   │   ├── execute.post.ts   # Command execution
│   │   │   ├── conversations.get.ts
│   │   │   └── conversations/[id].get.ts
│   │   ├── contact/              # Contact form endpoint
│   │   │   └── index.post.ts
│   │   ├── memory/               # User memory endpoints
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   └── [key].delete.ts
│   │   └── admin/                # Admin management endpoints
│   │       ├── rag/              # RAG document management
│   │       │   ├── index.get.ts
│   │       │   └── index.post.ts
│   │       ├── mcp/              # MCP service management
│   │       │   ├── index.get.ts
│   │       │   ├── index.post.ts
│   │       │   └── [id].delete.ts
│   │       ├── skills/           # Skills management
│   │       │   ├── index.get.ts
│   │       │   ├── scan.post.ts
│   │       │   └── [id].delete.ts
│   │       └── commands/         # Command whitelist management
│   │           ├── index.get.ts
│   │           ├── index.post.ts
│   │           └── [id].delete.ts
│   ├── middleware/               # Server middleware
│   │   └── auth.ts               # JWT verification
│   ├── utils/                    # Server utilities
│   │   ├── ai.ts                 # Qwen API (OpenAI-compatible format)
│   │   ├── auth.ts               # JWT + bcrypt utilities
│   │   ├── constants.ts          # Error messages, HTTP codes
│   │   ├── db.ts                 # MySQL operations
│   │   ├── embedding.ts          # Text embeddings (DashScope)
│   │   ├── executor.ts           # Command execution with whitelist
│   │   ├── mcp.ts                # MCP service integration
│   │   ├── memory.ts             # User memory management
│   │   ├── rag.ts                # RAG vector search (Vectra)
│   │   ├── response.ts           # API response helpers
│   │   ├── skills.ts             # Skills system management
│   │   └── validation.ts         # Zod schemas
│   └── __tests__/                # Server tests (9 files, 148 tests)
│       ├── ai.test.ts
│       ├── auth.test.ts
│       ├── db.test.ts
│       ├── validation.test.ts
│       ├── response.test.ts
│       ├── api.auth.test.ts
│       ├── api.chat.test.ts
│       └── api.contact.test.ts
│
├── database/                     # Database scripts
│   └── init.sql                  # MySQL initialization (10 tables)
│
├── docs/                         # RAG document storage
├── skills/                       # Custom skills directory
├── .vectra/                      # Vectra vector index storage
│
├── nuxt.config.ts                # Nuxt configuration
├── tailwind.config.ts            # TailwindCSS configuration
├── docker-compose.yml            # Docker Compose config
├── Dockerfile                    # Docker image config
├── nginx.conf                    # Nginx reverse proxy config
├── vitest.config.ts              # Vitest test config
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── README.md                     # Project documentation
└── AGENTS.md                     # This file
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Send message to AI (standard) |
| POST | /api/chat/stream | Send message to AI (SSE streaming) |
| POST | /api/chat/execute | Execute whitelisted command |
| GET | /api/chat/conversations | Get user conversations |
| GET | /api/chat/conversations/:id | Get conversation messages |

### Memory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/memory | Get user memories |
| POST | /api/memory | Create/update memory |
| DELETE | /api/memory/:key | Delete memory |

### Admin - RAG
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/rag | Get index status and documents |
| POST | /api/admin/rag | Index documents |

### Admin - MCP
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/mcp | List MCP services |
| POST | /api/admin/mcp | Create MCP service |
| DELETE | /api/admin/mcp/:id | Delete MCP service |

### Admin - Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/skills | List skills |
| POST | /api/admin/skills/scan | Scan skills directory |
| DELETE | /api/admin/skills/:id | Delete skill |

### Admin - Commands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/commands | List whitelisted commands |
| POST | /api/admin/commands | Add command to whitelist |
| DELETE | /api/admin/commands/:id | Remove command |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contact | Submit contact form |

---

## Server Utilities

### constants.ts
Centralized constants for error messages and HTTP status codes.

```typescript
ERROR_MESSAGES = {
  AI_NOT_CONFIGURED: 'AI服务未配置',
  AI_REQUEST_FAILED: 'AI服务请求失败',
  AUTH_REQUIRED: '请先登录',
  // ...
}

HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  // ...
}
```

### response.ts
Unified API response format.

```typescript
successResponse(data)           // Success response
errorResponse(message)          // Error response
throwBadRequest(message)        // Throw 400 error
throwUnauthorized(message)      // Throw 401 error
throwNotFound(message)          // Throw 404 error
```

### auth.ts
JWT and bcrypt utilities.

```typescript
hashPassword(password)          // Hash password
comparePassword(password, hash) // Verify password
generateToken(payload)          // Generate JWT
verifyToken(token)              // Verify JWT
requireAuth(event)              // Extract auth from event context
```

### db.ts
MySQL database operations.

```typescript
query<T>(sql, params)           // Execute query
queryOne<T>(sql, params)        // Get single row
insert(table, data)             // Insert row
update(table, data, where, params) // Update rows
remove(table, where, params)    // Delete rows
```

### ai.ts
Qwen API integration (OpenAI-compatible format).

```typescript
chatWithQwen(messages, options)           // Standard chat
streamChatWithQwen(messages, options)     // Streaming chat (async generator)
chatWithTools(messages, tools, executor)  // Chat with tool calling

// Options
interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  enableSearch?: boolean      // Web search
  enableThinking?: boolean    // Thinking mode
  tools?: Tool[]              // Function calling
}
```

### embedding.ts
Text embeddings via DashScope API.

```typescript
getEmbedding(text)             // Get single embedding
getEmbeddings(texts)           // Get multiple embeddings
```

### rag.ts
RAG vector search with Vectra.

```typescript
indexDocuments()               // Index .md files from docs/
searchDocuments(query, topK)   // Semantic search
getRAGContext(query, maxTokens) // Get formatted context for prompts
listDocuments()                // List indexed documents
deleteDocument(uri)            // Remove from index
getIndexStatus()               // Get index statistics
```

### memory.ts
User memory management.

```typescript
getUserMemories(userId)                    // Get all user memories
setMemory(userId, key, value, source)      // Create/update memory
deleteMemory(userId, key)                  // Delete memory
formatMemoriesForPrompt(memories)          // Format for AI prompt
parseMemoryCommand(message)                // Parse /remember, /forget
extractMemoriesFromConversation(userId, messages) // Auto-extract
```

### mcp.ts
MCP (Model Context Protocol) integration.

```typescript
getActiveServices()             // Get active MCP services
createService(data)             // Register new service
deleteService(id)               // Remove service
getAllTools()                   // Get all available MCP tools
executeTool(toolName, args)     // Execute MCP tool
convertToolsToOpenAIFormat(tools) // Convert to OpenAI function format
```

### skills.ts
Skills system management.

```typescript
getAllSkills()                  // Get all skills
getEnabledSkills()              // Get enabled skills
createSkill(data)               // Register skill
deleteSkill(id)                 // Remove skill
loadSkillDefinition(path)       // Parse SKILL.md file
scanSkillsDirectory()           // Auto-discover skills
getSkillsPrompt()               // Generate prompt for enabled skills
```

### executor.ts
Command execution with whitelist.

```typescript
getWhitelistedCommands()        // Get enabled commands
addCommand(data)                // Add to whitelist
deleteCommand(id)               // Remove from whitelist
isCommandWhitelisted(command)   // Check if allowed
executeCommand(command, timeout) // Execute command (30s timeout)
getExecutionTools()             // Get OpenAI function format
```

### validation.ts
Zod schemas for input validation.

```typescript
registerSchema   // Registration validation
loginSchema      // Login validation
chatSchema       // Chat message validation
contactSchema    // Contact form validation
validate(schema, data) // Validate helper
```

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| JWT_SECRET | JWT signing secret | Yes | - |
| JWT_EXPIRES_IN | JWT expiration time | No | 7d |
| DB_HOST | MySQL host | Yes | localhost |
| DB_PORT | MySQL port | Yes | 3306 |
| DB_NAME | Database name | Yes | tomybot |
| DB_USER | Database user | Yes | root |
| DB_PASSWORD | Database password | Yes | - |
| QWEN_API_KEY | Alibaba Qwen API key | Yes | - |
| QWEN_API_URL | Qwen API endpoint | No | dashscope.../compatible-mode/v1/chat/completions |
| QWEN_MODEL | Qwen model name | No | qwen-plus |
| QWEN_SYSTEM_PROMPT | System prompt | No | 你是TomyBot智能助手... |
| RAG_DOCS_PATH | RAG documents path | No | ./docs |
| RAG_INDEX_PATH | Vectra index path | No | ./.vectra |
| SKILLS_PATH | Skills directory | No | ./skills |
| CONTACT_EMAIL | Contact email | No | info@sayco.com.cn |
| SMTP_HOST | SMTP server host | No | - |

---

## Database Tables

| Table | Description |
|-------|-------------|
| users | User accounts |
| conversations | Chat sessions |
| messages | Chat messages |
| contacts | Contact form submissions |
| user_sessions | JWT refresh tokens |
| user_memories | User memory/context |
| mcp_services | MCP service configurations |
| skills | Skill definitions |
| whitelisted_commands | Command whitelist |
| system_config | System configuration |

---

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Use explicit types for function parameters
- Avoid `any` type
- Use Zod for runtime validation
- Centralize constants in `constants.ts`
- Use `response.ts` helpers for API responses

### Vue Components
- Composition API with `<script setup>`
- Use TypeScript for props
- Follow Vue 3 best practices

### CSS
- TailwindCSS utility classes
- Custom CSS variables in main.css
- Japanese-inspired design system:
  - Low saturation colors
  - Generous whitespace
  - Subtle shadows
  - Clean typography
  - Markdown prose styles

### File Naming
- Vue components: PascalCase or kebab-case
- TypeScript files: camelCase
- API routes: REST convention (resource.method.ts)

---

## Design System

### Colors
- `cream`: #faf9f6 (background)
- `sakura`: #f5ebe0 (light accent)
- `sand`: #e8e4de (border)
- `stone`: #9a8c7e (muted text)
- `charcoal`: #3d3d3d (text)
- `ink`: #1a1a1a (dark background)
- `matcha`: #7d9a78 (success)
- `indigo`: #4a5568 (primary)
- `sky`: #87ceeb (info)

### Typography
- Primary: Noto Sans SC
- Secondary: Inter
- Letter spacing: 0.05em - 0.08em for Japanese aesthetic

### Markdown Styles
- Code blocks with syntax highlighting (highlight.js)
- Tables with alternating row colors
- Blockquotes with left border
- Responsive images

---

## Testing Strategy

### Test Statistics
- **Test files**: 9
- **Test cases**: 148

### Unit Tests
- Server utilities (validation, auth, db, ai, response)
- API endpoint logic
- Vue composables

### Integration Tests
- Full API request/response cycles
- Database operations

### Run Tests
```bash
npm run test
npm run test:coverage
```

---

## Key Features

### Streaming Chat
- SSE (Server-Sent Events) for real-time responses
- RAG context injection
- User memory injection
- Thinking mode with collapsible reasoning

### RAG System
- Vectra for local vector storage
- DashScope text-embedding-v3 for embeddings
- Markdown document indexing
- Semantic search for context retrieval

### User Memory
- Auto-extraction from conversations
- Manual management via `/remember` and `/forget` commands
- Persistent storage in MySQL

### MCP Integration
- Stdio transport for MCP servers
- Tool discovery and execution
- OpenAI function format conversion

### Skills System
- SKILL.md based skill definitions
- Auto-discovery from skills directory
- Prompt injection for enabled skills

### Command Execution
- Whitelist-based security
- 30-second timeout
- stdout/stderr capture

---

## Known Issues

### Nuxt Auto-Imports
- `requireAuth`, `useAuth`, `navigateTo` are Nuxt auto-imports
- LSP may show "not found" errors in IDE
- These work correctly at runtime
- Do not add explicit imports for these

### NPM Cache
- If npm install fails with permission errors:
  ```bash
  npm install --cache=/tmp/npm-cache
  ```
