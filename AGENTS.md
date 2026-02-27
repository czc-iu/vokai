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
mysql -u root -p < deploy/database/init.sql

# Set admin role (optional)
mysql -u root -p < deploy/database/set-admin.sql
```

### Docker Deployment
```bash
# Build and start all services
cd deploy/docker && docker-compose up -d

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
│   │   ├── ChatMessage.vue       # Chat message with Markdown rendering
│   │   ├── LanguageSwitcher.vue  # Language switcher
│   │   ├── Notification.vue      # Toast notifications
│   │   ├── EditModal.vue         # Edit modal
│   │   ├── UploadModal.vue       # File upload modal
│   │   └── ViewModal.vue         # View modal
│   ├── composables/              # Vue composables
│   │   └── useAuth.ts            # Auth state management
│   ├── layouts/                  # Layout components
│   │   ├── default.vue           # Main layout with nav/footer
│   │   └── admin.vue             # Admin layout with sidebar
│   ├── middleware/               # Route middleware
│   │   └── auth.ts               # Auth guard (requireAuth)
│   ├── pages/                    # Page components
│   │   ├── index.vue             # Homepage
│   │   ├── login.vue             # Login page
│   │   ├── register.vue          # Registration page
│   │   ├── chat.vue              # AI chat interface (streaming + markdown)
│   │   ├── contact.vue           # Contact form
│   │   ├── services.vue          # Service packages
│   │   ├── cart.vue              # Shopping cart
│   │   ├── checkout.vue          # Checkout page
│   │   ├── billing.vue           # Billing management
│   │   ├── account.vue           # User account
│   │   ├── orders/               # Order pages
│   │   ├── knowledge-base/       # Knowledge base management
│   │   ├── admin/                # Admin pages
│   │   │   ├── index.vue         # Admin dashboard
│   │   │   ├── rag.vue           # RAG management
│   │   │   ├── mcp.vue           # MCP management
│   │   │   ├── skills.vue        # Skills management
│   │   │   └── commands.vue      # Command whitelist
│   │   ├── embed.vue             # Embedded chat
│   │   ├── share/[id].vue        # Shared conversation
│   │   ├── privacy.vue           # Privacy policy
│   │   ├── terms.vue             # Terms of service
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
│   │   ├── services/             # Service packages
│   │   │   ├── index.get.ts
│   │   │   └── [id].get.ts
│   │   ├── cart/                 # Shopping cart
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].put.ts
│   │   │   └── [id].delete.ts
│   │   ├── orders/               # Order management
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].get.ts
│   │   │   ├── checkout.post.ts
│   │   │   ├── [id]/pay.post.ts
│   │   │   └── [id]/cancel.post.ts
│   │   ├── billing/              # Billing system
│   │   │   ├── balance.get.ts
│   │   │   ├── stats.get.ts
│   │   │   └── transactions.get.ts
│   │   ├── points/               # Points system
│   │   │   ├── info.get.ts
│   │   │   └── redeem.post.ts
│   │   ├── account/              # Account management
│   │   │   ├── index.get.ts
│   │   │   ├── index.put.ts
│   │   │   ├── password.put.ts
│   │   │   └── phone.put.ts
│   │   ├── knowledge-base/       # User knowledge base
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts
│   │   │   └── [id].delete.ts
│   │   ├── embed/                # Embedded chat
│   │   │   ├── config.get.ts
│   │   │   └── chat.post.ts
│   │   ├── share/                # Share functionality
│   │   │   ├── index.post.ts
│   │   │   └── [id].get.ts
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
│   │       ├── commands/         # Command whitelist management
│   │       │   ├── index.get.ts
│   │       │   ├── index.post.ts
│   │       │   └── [id].delete.ts
│   │       └── admins/           # Admin management
│   │           ├── index.get.ts
│   │           └── index.post.ts
│   ├── middleware/               # Server middleware
│   │   └── auth.ts               # JWT verification
│   ├── utils/                    # Server utilities
│   │   ├── ai.ts                 # Qwen API (OpenAI-compatible format)
│   │   ├── auth.ts               # JWT + bcrypt utilities
│   │   ├── adminAuth.ts          # Admin role verification
│   │   ├── adminOrders.ts        # Admin order utilities
│   │   ├── adminUsers.ts         # Admin user utilities
│   │   ├── constants.ts          # Error messages, HTTP codes
│   │   ├── db.ts                 # MySQL operations
│   │   ├── billing.ts            # Billing utilities
│   │   ├── orders.ts             # Order utilities
│   │   ├── services.ts           # Service package utilities
│   │   ├── alipay.ts             # Alipay payment
│   │   ├── wechat.ts             # WeChat payment
│   │   ├── embedding.ts          # Text embeddings (DashScope)
│   │   ├── executor.ts           # Command execution with whitelist
│   │   ├── mcp.ts                # MCP service integration
│   │   ├── memory.ts             # User memory management
│   │   ├── rag.ts                # RAG vector search (Vectra)
│   │   ├── userRag.ts            # User RAG management
│   │   ├── membership.ts         # Membership management
│   │   ├── tokenCalculator.ts    # Token calculation
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
├── deploy/                       # Deployment configuration
│   ├── docker/                   # Docker configuration
│   │   ├── Dockerfile            # Docker image config
│   │   └── docker-compose.yml    # Docker Compose config
│   ├── nginx/                    # Nginx configuration
│   │   └── nginx.conf            # Nginx reverse proxy config
│   └── database/                 # Database scripts
│       ├── init.sql              # MySQL initialization (20 tables)
│       ├── set-admin.sql         # Set admin role
│       ├── add_embed_configs.sql
│       ├── add_member_points.sql
│       ├── add_user_knowledge_base.sql
│       ├── add_websearch_mcp.sql
│       └── init_tokens.sql
│
├── knowledge/                    # RAG knowledge base storage
├── skills/                       # Custom skills directory
│   ├── xlsx/                     # Excel processing (official)
│   ├── pdf/                      # PDF processing (official)
│   ├── docx/                     # Word processing (official)
│   ├── pptx/                     # PPT processing (official)
│   ├── faq-handler/              # FAQ handler
│   ├── order-tracking/           # Order tracking
│   ├── product-recommendation/   # Product recommendation
│   ├── appointment-booking/      # Appointment booking
│   ├── complaint-handling/       # Complaint handling
│   └── return-refund/            # Return and refund
├── .vectra/                      # Vectra vector index storage
│
├── nuxt.config.ts                # Nuxt configuration
├── tailwind.config.ts            # TailwindCSS configuration
├── vitest.config.ts              # Vitest test config
├── requirements.txt              # Python dependencies
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── README.md                     # Project documentation
└── AGENTS.md                     # This file
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | User registration | No |
| POST | /api/auth/login | User login | No |
| GET | /api/auth/me | Get current user | Yes |

### Chat
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/chat | Send message to AI (standard) | Yes |
| POST | /api/chat/stream | Send message to AI (SSE streaming) | Yes |
| POST | /api/chat/execute | Execute whitelisted command | Yes |
| GET | /api/chat/conversations | Get user conversations | Yes |
| GET | /api/chat/conversations/:id | Get conversation messages | Yes |

### Memory
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/memory | Get user memories | Yes |
| POST | /api/memory | Create/update memory | Yes |
| DELETE | /api/memory/:key | Delete memory | Yes |

### Services
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/services | Get service list | No |
| GET | /api/services/:id | Get service details | No |

### Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/cart | Get shopping cart | Yes |
| POST | /api/cart | Add to cart | Yes |
| PUT | /api/cart/:id | Update cart item | Yes |
| DELETE | /api/cart/:id | Remove cart item | Yes |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/orders | Get order list | Yes |
| POST | /api/orders | Create order | Yes |
| GET | /api/orders/:id | Get order details | Yes |
| POST | /api/orders/checkout | Checkout cart | Yes |
| POST | /api/orders/:id/pay | Pay order | Yes |
| POST | /api/orders/:id/cancel | Cancel order | Yes |

### Billing
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/billing/balance | Get token balance | Yes |
| GET | /api/billing/stats | Get consumption stats | Yes |
| GET | /api/billing/transactions | Get transaction history | Yes |

### Points
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/points/info | Get points info | Yes |
| POST | /api/points/redeem | Redeem points | Yes |

### Account
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/account | Get account info | Yes |
| PUT | /api/account | Update account info | Yes |
| PUT | /api/account/password | Change password | Yes |
| PUT | /api/account/phone | Bind phone | Yes |

### Knowledge Base
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/knowledge-base | Get knowledge base list | Yes |
| POST | /api/knowledge-base | Create knowledge base | Yes |
| GET | /api/knowledge-base/:id | Get knowledge base details | Yes |
| PUT | /api/knowledge-base/:id | Update knowledge base | Yes |
| DELETE | /api/knowledge-base/:id | Delete knowledge base | Yes |

### Embed
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/embed/config | Get embed config | No |
| POST | /api/embed/chat | Embedded chat | No |

### Share
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/share | Create share | Yes |
| GET | /api/share/:id | Get shared content | No |

### Contact
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/contact | Submit contact form | No |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/bank-info | Get bank transfer info | No |
| POST | /api/payments/alipay | Create Alipay payment | Yes |
| POST | /api/payments/wechat | Create WeChat payment | Yes |
| GET | /api/payments/status/:paymentNo | Query payment status | Yes |
| POST | /api/payments/notify | Alipay async notification | No |
| GET | /api/payments/return | Alipay sync redirect | No |
| POST | /api/payments/wechat/notify | WeChat async notification | No |

### Admin - RAG
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/rag | Get index status and documents | Admin |
| POST | /api/admin/rag | Index documents | Admin |

### Admin - MCP
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/mcp | List MCP services | Admin |
| POST | /api/admin/mcp | Create MCP service | Admin |
| DELETE | /api/admin/mcp/:id | Delete MCP service | Admin |

### Admin - Skills
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/skills | List skills | Admin |
| POST | /api/admin/skills/scan | Scan skills directory | Admin |
| DELETE | /api/admin/skills/:id | Delete skill | Admin |

### Admin - Commands
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/commands | List whitelisted commands | Admin |
| POST | /api/admin/commands | Add command to whitelist | Admin |
| DELETE | /api/admin/commands/:id | Remove command | Admin |

### Admin - Admins
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/admins | List admins | Admin |
| POST | /api/admin/admins | Set admin role | Admin |

### Admin - Stats
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/stats/overview | System overview stats | Admin |
| GET | /api/admin/stats/trends | Data trends | Admin |

### Admin - Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/users | User list | Admin |
| GET | /api/admin/users/:id | User details | Admin |
| PUT | /api/admin/users/:id | Update user | Admin |

### Admin - Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/orders | Order list | Admin |
| GET | /api/admin/orders/:id | Order details | Admin |
| PUT | /api/admin/orders/:id | Update order | Admin |

### Admin - Transactions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/transactions | Transaction records | Admin |

### Admin - Services
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/services | Service packages | Admin |
| POST | /api/admin/services | Create service | Admin |
| PUT | /api/admin/services/:id | Update service | Admin |
| DELETE | /api/admin/services/:id | Delete service | Admin |

### Admin - System
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/admin/init-balances | Initialize user balances | Admin |
| POST | /api/admin/seed-admin | Create admin account | Admin |
| GET | /api/admin/check | Check admin status | Admin |

### Admin - Usage
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/usage/daily | Daily usage stats | Admin |
| GET | /api/admin/usage/summary | Usage summary | Admin |

---

## Server Utilities

### constants.ts
Centralized constants for error messages and HTTP status codes.

```typescript
ERROR_MESSAGES = {
  AI_NOT_CONFIGURED: 'AI服务未配置',
  AI_REQUEST_FAILED: 'AI服务请求失败',
  AUTH_REQUIRED: '请先登录',
  ADMIN_REQUIRED: '需要管理员权限',
  // ...
}

HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
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
throwForbidden(message)         // Throw 403 error
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

### adminAuth.ts
Admin role verification.

```typescript
requireAdmin(event)             // Verify admin role, throw 403 if not admin
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
indexDocuments()               // Index .md files from knowledge/
searchDocuments(query, topK)   // Semantic search
getRAGContext(query, maxTokens) // Get formatted context for prompts
listDocuments()                // List indexed documents
deleteDocument(uri)            // Remove from index
getIndexStatus()               // Get index statistics
```

### userRag.ts
User knowledge base management.

```typescript
createKnowledgeBase(userId, data)    // Create user knowledge base
getUserKnowledgeBases(userId)        // Get user knowledge bases
updateKnowledgeBase(id, data)        // Update knowledge base
deleteKnowledgeBase(id)              // Delete knowledge base
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

### billing.ts
Billing and token management.

```typescript
getUserBalance(userId)          // Get user token balance
updateBalance(userId, amount)   // Update balance
consumeTokens(userId, amount)   // Consume tokens
getTransactionHistory(userId)   // Get transaction history
```

### orders.ts
Order management utilities.

```typescript
createOrder(userId, data)       // Create order
getOrderById(id)                // Get order details
getUserOrders(userId)           // Get user orders
updateOrderStatus(id, status)   // Update order status
```

### services.ts
Service package utilities.

```typescript
getAllServices()                // Get all services
getServiceById(id)              // Get service details
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
| RAG_DOCS_PATH | RAG documents path | No | ./knowledge |
| RAG_INDEX_PATH | Vectra index path | No | ./.vectra |
| SKILLS_PATH | Skills directory | No | ./skills |
| CONTACT_EMAIL | Contact email | No | info@sayco.com.cn |
| SMTP_HOST | SMTP server host | No | - |

---

## Database Tables

| Table | Description |
|-------|-------------|
| users | User accounts (with role field) |
| conversations | Chat sessions |
| messages | Chat messages |
| contacts | Contact form submissions |
| user_sessions | JWT refresh tokens |
| system_config | System configuration |
| user_memories | User memory/context |
| mcp_services | MCP service configurations |
| skills | Skill definitions |
| whitelisted_commands | Command whitelist |
| token_balances | Token balance |
| token_transactions | Token transaction records |
| token_daily_stats | Daily token consumption stats |
| services | Service packages |
| cart_items | Shopping cart items |
| orders | Orders |
| order_items | Order items |
| payments | Payment records |
| shared_messages | Shared messages |
| admins | Admin accounts |
| admin_logs | Admin operation logs |

### ER Relations

```
users ──┬──< conversations ──< messages
        ├──< user_sessions
        ├──< user_memories
        ├──< token_balances ──< token_transactions
        ├──< token_daily_stats
        ├──< cart_items
        ├──< orders ──< order_items ──< payments
        ├──< shared_messages
        ├──< admins ──< admin_logs

services ──< cart_items
services ──< order_items

mcp_services (standalone)
skills (standalone)
whitelisted_commands (standalone)
contacts (standalone)
system_config (standalone)
```

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
- User knowledge base support

### User Memory
- Auto-extraction from conversations
- Manual management via `/remember` and `/forget` commands
- Persistent storage in MySQL

### MCP Integration
- Stdio transport for MCP servers
- Tool discovery and execution
- OpenAI function format conversion

**Configured MCP Services:**
- **web-search** - Multi-provider web search (DuckDuckGo, Bing, SearXNG)
  - Package: `@zhafron/mcp-web-search`
  - Location: `/mcp-services/`
  - Tools: `web-search:search`, `web-search:fetch_content`
  - No API key required

### Skills System
- SKILL.md based skill definitions
- Auto-discovery from skills directory
- Prompt injection for enabled skills

**Official Skills (from skills.sh):**
- xlsx - Excel file processing
- pdf - PDF file processing
- docx - Word document processing
- pptx - PowerPoint processing

**Custom Skills:**
- faq-handler - FAQ auto-response
- order-tracking - Order tracking
- product-recommendation - Product recommendations
- appointment-booking - Appointment booking
- complaint-handling - Complaint handling
- return-refund - Return and refund processing

### Command Execution
- Whitelist-based security for shell commands
- Python code execution capability
- 30-second timeout
- stdout/stderr capture

**Available Tools:**
- `execute_command` - Execute whitelisted shell commands (e.g., date, echo, node, python3)
- `execute_python` - Execute Python code for calculations, data processing, file operations

**Whitelisted Commands:**
- python3 - Python 3 interpreter
- node - Node.js runtime
- date - Display date/time
- echo - Output text
- zip/unzip - File compression

### Commercial Features
- Service packages with different tiers
- Shopping cart with batch checkout
- Order management (create, pay, cancel)
- Token-based billing
- Points system for rewards

### Multilingual Support
- Chinese (zh-CN) - Full support
- English (en-US) - Full support
- Japanese (ja-JP) - Full support

---

## Admin Backend

### Access
```sql
-- Set admin role
UPDATE users SET role = 'admin' WHERE id = 1;
```

Access at: `http://localhost:3000/admin`

### Features
- Dashboard - System overview, quick actions
- RAG Management - Document indexing
- MCP Management - MCP services
- Skills Management - Skills scanning and management
- Commands Management - Command whitelist

---

## Service Packages

| Package | Price | Tokens | Validity |
|---------|-------|--------|----------|
| Trial | ¥9.90/mo | 10K | 1 month |
| Basic | ¥39.90/mo | 50K | 3 months |
| Pro | ¥129.90/mo | 200K | 6 months |
| Enterprise | ¥499.90/mo | 1M | Permanent |

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

---

## Related Documentation

- [Admin Documentation](./docs/ADMIN.md)
- [Admin Test Report](./docs/ADMIN_TEST_REPORT.md)
- [Skills Install Report](./docs/SKILLS_INSTALL_REPORT.md)
- [Official Skills Import Report](./docs/OFFICIAL_SKILLS_IMPORT_REPORT.md)
- [README](./README.md)
