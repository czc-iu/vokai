# TomyBot - AI 智能助手

> 让客服更智能，让服务更高效

TomyBot 是一个基于 Nuxt 3 的全栈 AI 智能客服系统，集成阿里云通义千问（Qwen）大模型，提供企业级智能对话服务。采用日系极简设计风格，为用户提供优雅的交互体验。

## 功能特性

### 🎯 核心功能

- **用户认证** - 注册、登录、JWT Token 认证、角色权限管理
- **AI 智能对话** - 基于阿里云 Qwen 大模型的智能客服
- **流式响应** - SSE 实时流式输出，支持 Markdown 渲染
- **联网搜索** - 支持 Qwen 联网搜索功能
- **深度思考** - 支持开启/关闭思考模式，展示推理过程
- **对话管理** - 多会话管理、历史记录持久化
- **多语言支持** - 中文、英文、日文三语切换

### 💰 商业功能

- **服务套餐** - 体验版、基础版、专业版、企业版多种套餐
- **购物车系统** - 服务商品加入购物车、批量结算
- **订单系统** - 订单创建、支付、取消、查询
- **计费系统** - Token余额管理、消费统计、账单明细
- **积分系统** - 积分兑换、余额充值
- **会员管理** - 会员权益、有效期管理

### 🧠 高级 AI 功能

- **RAG 知识库** - 基于 Vectra 的向量检索增强生成
  - 系统知识库：管理员管理文档索引
  - 用户知识库：用户上传个人文档
- **用户记忆** - 自动提取用户信息，支持手动记忆管理
- **MCP 服务** - 集成 Model Context Protocol，支持外部工具调用
- **Skills 技能** - 基于 SKILL.md 的自定义技能系统
  - 4个官方技能（Excel、PDF、Word、PPT处理）
  - 6个自定义技能（FAQ、订单追踪、产品推荐等）
- **命令执行** - 白名单控制的命令行工具执行

### ⚙️ 管理后台

- **控制台** - 系统概览、快捷操作、状态监控
- **RAG 管理** - 文档索引、状态查看
- **MCP 管理** - MCP服务添加/删除
- **技能管理** - 技能扫描、启用/禁用
- **命令管理** - 命令白名单管理
- **用户管理** - 管理员账号管理

### 🔧 技术特性

- **类型安全** - TypeScript 严格模式
- **输入验证** - Zod 运行时验证
- **响应式设计** - 移动端优先的响应式布局
- **测试覆盖** - 148+ 单元测试
- **权限控制** - 基于角色的访问控制（RBAC）

### 🌐 嵌入式功能

- **嵌入聊天** - 可嵌入第三方网站的聊天组件
- **分享功能** - 对话消息分享链接

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Nuxt 3 + Vue 3 |
| UI 框架 | TailwindCSS |
| 后端 API | Nuxt Server API |
| 数据库 | MySQL 8.0 |
| 认证 | JWT + bcrypt |
| AI 模型 | 阿里云 Qwen (通义千问) / SiliconFlow |
| 向量数据库 | Vectra |
| MCP SDK | @modelcontextprotocol/sdk |
| 验证 | Zod |
| 部署 | Docker + Nginx |
| 多语言 | @nuxtjs/i18n |

## 快速开始

### 环境要求
- Node.js 20+
- MySQL 8.0+
- npm 或 pnpm

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd Tomybot

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 编辑 .env 文件，填入必要配置
```

### 配置环境变量

```bash
# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tomybot
DB_USER=root
DB_PASSWORD=your-password

# Qwen API (或使用 SiliconFlow)
QWEN_API_KEY=your-qwen-api-key
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
QWEN_MODEL=qwen-plus
QWEN_SYSTEM_PROMPT=你是TomyBot智能助手...

# RAG 知识库
RAG_DOCS_PATH=./docs
RAG_INDEX_PATH=./.vectra

# Skills 技能
SKILLS_PATH=./skills

# 联系邮箱
CONTACT_EMAIL=info@sayco.com.cn
```

### 初始化数据库

```bash
mysql -u root -p < deploy/database/init.sql
```

### 设置管理员权限

```bash
mysql -u root -p < deploy/database/set-admin.sql
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
Tomybot/
├── app/                          # Nuxt 应用
│   ├── assets/css/               # 全局样式
│   ├── components/               # Vue 组件
│   │   ├── ChatMessage.vue       # 聊天消息组件（Markdown）
│   │   ├── LanguageSwitcher.vue  # 语言切换
│   │   ├── Notification.vue      # 通知组件
│   │   ├── EditModal.vue         # 编辑模态框
│   │   ├── UploadModal.vue       # 上传模态框
│   │   └── ViewModal.vue         # 查看模态框
│   ├── composables/              # Vue Composables
│   │   └── useAuth.ts            # 认证状态管理
│   ├── layouts/                  # 布局组件
│   │   ├── default.vue           # 默认布局
│   │   └── admin.vue             # 管理后台布局
│   ├── middleware/               # 路由中间件
│   │   └── auth.ts               # 认证守卫
│   ├── pages/                    # 页面组件
│   │   ├── index.vue             # 首页
│   │   ├── login.vue             # 登录
│   │   ├── register.vue          # 注册
│   │   ├── chat.vue              # AI 对话（流式 + Markdown）
│   │   ├── contact.vue           # 联系我们
│   │   ├── services.vue          # 服务套餐
│   │   ├── cart.vue              # 购物车
│   │   ├── checkout.vue          # 结算
│   │   ├── billing.vue           # 账单管理
│   │   ├── account.vue           # 个人中心
│   │   ├── orders/               # 订单页面
│   │   ├── knowledge-base/       # 知识库管理
│   │   ├── admin/                # 管理后台
│   │   │   ├── index.vue         # 控制台
│   │   │   ├── rag.vue           # RAG管理
│   │   │   ├── mcp.vue           # MCP管理
│   │   │   ├── skills.vue        # 技能管理
│   │   │   └── commands.vue      # 命令管理
│   │   ├── embed.vue             # 嵌入式聊天
│   │   ├── share/[id].vue        # 分享页面
│   │   ├── privacy.vue           # 隐私政策
│   │   ├── terms.vue             # 服务条款
│   │   └── coming-soon.vue       # 敬请期待
│   └── app.vue                   # 根组件
│
├── server/                       # 服务端代码
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证接口
│   │   ├── chat/                 # 对话接口
│   │   ├── memory/               # 用户记忆
│   │   ├── contact/              # 联系表单
│   │   ├── services/             # 服务套餐
│   │   ├── cart/                 # 购物车
│   │   ├── orders/               # 订单管理
│   │   ├── billing/              # 账单系统
│   │   ├── points/               # 积分系统
│   │   ├── account/              # 账户管理
│   │   ├── knowledge-base/       # 知识库
│   │   ├── embed/                # 嵌入式聊天
│   │   ├── share/                # 分享功能
│   │   └── admin/                # 管理接口
│   │       ├── rag/              # RAG 管理
│   │       ├── mcp/              # MCP 服务管理
│   │       ├── skills/           # 技能管理
│   │       └── commands/         # 命令白名单管理
│   ├── utils/                    # 工具函数
│   │   ├── ai.ts                 # Qwen API 集成
│   │   ├── auth.ts               # 认证工具
│   │   ├── adminAuth.ts          # 管理员权限验证
│   │   ├── db.ts                 # 数据库操作
│   │   ├── billing.ts            # 计费工具
│   │   ├── orders.ts             # 订单工具
│   │   ├── services.ts           # 服务套餐工具
│   │   ├── embedding.ts          # 文本嵌入
│   │   ├── executor.ts           # 命令执行器
│   │   ├── mcp.ts                # MCP 服务集成
│   │   ├── memory.ts             # 用户记忆管理
│   │   ├── rag.ts                # RAG 向量检索
│   │   ├── userRag.ts            # 用户RAG
│   │   ├── membership.ts         # 会员管理
│   │   ├── tokenCalculator.ts    # Token计算
│   │   ├── response.ts           # API 响应
│   │   ├── skills.ts             # 技能系统
│   │   ├── constants.ts          # 常量定义
│   │   └── validation.ts         # 输入验证
│   └── __tests__/                # 测试文件
│
├── i18n/                         # 国际化
│   └── locales/                  # 语言文件
│       ├── zh-CN.json            # 中文
│       ├── en-US.json            # 英文
│       └── ja-JP.json            # 日文
│
├── deploy/                       # 部署配置
│   ├── docker/                   # Docker 配置
│   │   ├── Dockerfile            # Docker 镜像
│   │   └── docker-compose.yml    # Docker Compose
│   ├── nginx/                    # Nginx 配置
│   │   └── nginx.conf            # Nginx 反向代理
│   └── database/                 # 数据库脚本
│       ├── init.sql              # 初始化脚本
│       └── set-admin.sql         # 设置管理员
│
├── docs/                         # RAG 知识库文档
├── skills/                       # 自定义技能目录
│   ├── xlsx/                     # Excel处理（官方）
│   ├── pdf/                      # PDF处理（官方）
│   ├── docx/                     # Word处理（官方）
│   ├── pptx/                     # PPT处理（官方）
│   ├── faq-handler/              # FAQ应答
│   ├── order-tracking/           # 订单追踪
│   ├── product-recommendation/   # 产品推荐
│   ├── appointment-booking/      # 预约预订
│   ├── complaint-handling/       # 投诉处理
│   └── return-refund/            # 退换货
│
├── .vectra/                      # Vectra 向量索引
│
├── nuxt.config.ts                # Nuxt 配置
├── tailwind.config.ts            # Tailwind 配置
├── vitest.config.ts              # 测试配置
├── requirements.txt              # Python 依赖
├── package.json                  # Node.js 依赖
├── .env.example                  # 环境变量模板
└── README.md                     # 项目文档
```

## API 文档

### 认证接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| POST | /api/auth/register | 用户注册 | ❌ |
| POST | /api/auth/login | 用户登录 | ❌ |
| GET | /api/auth/me | 获取当前用户 | ✅ |

### 对话接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| POST | /api/chat | 发送消息（标准模式） | ✅ |
| POST | /api/chat/stream | 流式对话（SSE） | ✅ |
| POST | /api/chat/execute | 执行白名单命令 | ✅ |
| GET | /api/chat/conversations | 获取对话列表 | ✅ |
| GET | /api/chat/conversations/:id | 获取对话消息 | ✅ |

### 用户记忆接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/memory | 获取用户记忆 | ✅ |
| POST | /api/memory | 创建/更新记忆 | ✅ |
| DELETE | /api/memory/:key | 删除记忆 | ✅ |

### 服务套餐接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/services | 获取服务列表 | ❌ |
| GET | /api/services/:id | 获取服务详情 | ❌ |

### 购物车接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/cart | 获取购物车 | ✅ |
| POST | /api/cart | 添加到购物车 | ✅ |
| PUT | /api/cart/:id | 更新购物车项 | ✅ |
| DELETE | /api/cart/:id | 删除购物车项 | ✅ |

### 订单接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/orders | 获取订单列表 | ✅ |
| POST | /api/orders | 创建订单 | ✅ |
| GET | /api/orders/:id | 获取订单详情 | ✅ |
| POST | /api/orders/checkout | 结算购物车 | ✅ |
| POST | /api/orders/:id/pay | 支付订单 | ✅ |
| POST | /api/orders/:id/cancel | 取消订单 | ✅ |

### 计费接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/billing/balance | 获取余额 | ✅ |
| GET | /api/billing/stats | 获取消费统计 | ✅ |
| GET | /api/billing/transactions | 获取交易记录 | ✅ |

### 积分接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/points/info | 获取积分信息 | ✅ |
| POST | /api/points/redeem | 积分兑换 | ✅ |

### 账户接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/account | 获取账户信息 | ✅ |
| PUT | /api/account | 更新账户信息 | ✅ |
| PUT | /api/account/password | 修改密码 | ✅ |
| PUT | /api/account/phone | 绑定手机 | ✅ |

### 知识库接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/knowledge-base | 获取知识库列表 | ✅ |
| POST | /api/knowledge-base | 创建知识库 | ✅ |
| GET | /api/knowledge-base/:id | 获取知识库详情 | ✅ |
| PUT | /api/knowledge-base/:id | 更新知识库 | ✅ |
| DELETE | /api/knowledge-base/:id | 删除知识库 | ✅ |

### 嵌入式接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/embed/config | 获取嵌入配置 | ❌ |
| POST | /api/embed/chat | 嵌入式对话 | ❌ |

### 分享接口

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| POST | /api/share | 创建分享 | ✅ |
| GET | /api/share/:id | 获取分享内容 | ❌ |

### 管理接口

#### RAG 管理
| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/admin/rag | 获取索引状态 | Admin |
| POST | /api/admin/rag | 索引文档 | Admin |

#### MCP 管理
| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/admin/mcp | 列出服务 | Admin |
| POST | /api/admin/mcp | 注册服务 | Admin |
| DELETE | /api/admin/mcp/:id | 删除服务 | Admin |

#### 技能管理
| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/admin/skills | 列出技能 | Admin |
| POST | /api/admin/skills/scan | 扫描技能 | Admin |
| DELETE | /api/admin/skills/:id | 删除技能 | Admin |

#### 命令管理
| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/admin/commands | 列出命令 | Admin |
| POST | /api/admin/commands | 添加命令 | Admin |
| DELETE | /api/admin/commands/:id | 删除命令 | Admin |

#### 管理员管理
| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | /api/admin/admins | 列出管理员 | Admin |
| POST | /api/admin/admins | 设置管理员 | Admin |

### 联系表单

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| POST | /api/contact | 提交联系表单 | ❌ |

## 数据库设计

### 数据表

| 表名 | 描述 |
|------|------|
| users | 用户信息（含角色权限） |
| conversations | 对话会话 |
| messages | 对话消息 |
| contacts | 联系表单 |
| user_sessions | 用户会话 |
| user_memories | 用户记忆 |
| mcp_services | MCP 服务配置 |
| skills | 技能定义 |
| whitelisted_commands | 命令白名单 |
| system_config | 系统配置 |
| services | 服务套餐 |
| cart_items | 购物车 |
| orders | 订单 |
| order_items | 订单项 |
| transactions | 交易记录 |
| user_knowledge | 用户知识库 |

### ER 关系

```
users ──┬──< conversations ──< messages
        ├──< user_sessions
        ├──< user_memories
        ├──< cart_items
        ├──< orders ──< order_items
        ├──< transactions
        └──< user_knowledge

services ──< cart_items
services ──< order_items

mcp_services (独立)
skills (独立)
whitelisted_commands (独立)
contacts (独立)
```

## 高级功能说明

### RAG 知识库

**系统知识库：**
1. 将 Markdown 文档放入 `docs/` 目录
2. 调用 `POST /api/admin/rag` 索引文档
3. 对话时自动检索相关内容注入上下文

**用户知识库：**
1. 用户上传个人文档
2. 支持增删改查
3. 自动向量化存储

### 用户记忆

- **自动提取**: 系统从对话中自动识别姓名、职业、公司等信息
- **手动管理**: 使用 `/remember <key> <value>` 和 `/forget <key>` 命令
- **持久化**: 存储在 MySQL 数据库

### MCP 服务

支持接入任何兼容 MCP 协议的服务：
```json
{
  "name": "weather",
  "command": "npx",
  "args": ["@mcp/weather-server"],
  "env": {}
}
```

### Skills 技能系统

**官方技能（来自 skills.sh）：**
- **xlsx** - Excel文件处理（pandas, openpyxl）
- **pdf** - PDF文件处理（pypdf, pdfplumber）
- **docx** - Word文档处理（docx-js）
- **pptx** - PPT演示文稿处理（pptxgenjs）

**自定义技能：**
- **faq-handler** - FAQ自动应答
- **order-tracking** - 订单追踪
- **product-recommendation** - 产品推荐
- **appointment-booking** - 预约预订
- **complaint-handling** - 投诉处理
- **return-refund** - 退换货处理

### 命令执行

默认白名单命令：`python3`, `node`, `date`, `echo`

可通过管理接口添加/删除命令。

### 多语言支持

- **中文** (zh-CN) - 完整支持
- **English** (en-US) - 完整支持
- **日本語** (ja-JP) - 完整支持

## 部署指南

### Docker 部署（推荐）

```bash
# 构建并启动
cd deploy/docker
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 手动部署

```bash
# 构建
npm run build

# 启动
npm run preview
```

## 开发指南

### 常用命令

```bash
# 开发
npm run dev

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage
```

### 代码规范

- **TypeScript**: 严格模式，显式类型
- **Vue**: Composition API + `<script setup>`
- **CSS**: TailwindCSS 工具类
- **命名**: 
  - Vue 组件: PascalCase
  - TypeScript: camelCase
  - API 路由: REST 约定

### 设计系统

采用日系极简风格：

| 颜色 | 用途 |
|------|------|
| cream (#faf9f6) | 背景 |
| sakura (#f5ebe0) | 浅色强调 |
| indigo (#4a5568) | 主色调 |
| charcoal (#3d3d3d) | 文字 |
| matcha (#7d9a78) | 成功/积极 |

## 测试

### 测试统计
- **测试文件**: 9 个
- **测试用例**: 148 个

### 运行测试

```bash
# 运行所有测试
npm run test

# 带覆盖率报告
npm run test:coverage
```

## 管理后台

### 访问方式

1. **设置管理员权限**
```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

2. **访问管理后台**
```
http://localhost:3000/admin
```

### 功能模块

- **控制台** - 系统概览、快捷操作
- **RAG管理** - 文档索引管理
- **MCP管理** - MCP服务管理
- **技能管理** - 技能扫描和管理
- **命令管理** - 命令白名单管理

## 服务套餐

| 套餐 | 价格 | Tokens | 有效期 |
|------|------|--------|--------|
| 体验版 | ¥9.90/月 | 1万 | 1个月 |
| 基础版 | ¥39.90/月 | 5万 | 3个月 |
| 专业版 | ¥129.90/月 | 20万 | 6个月 |
| 企业版 | ¥499.90/月 | 100万 | 永久 |

## 许可证

© 2026 赛熠可信息技术（上海）有限公司

## 联系方式

- 邮箱: info@sayco.com.cn
- 公司: 赛熠可信息技术（上海）有限公司
- 网站: https://tomybot.com

## 相关文档

- [管理后台文档](./docs/ADMIN.md)
- [管理后台测试报告](./docs/ADMIN_TEST_REPORT.md)
- [技能安装报告](./docs/SKILLS_INSTALL_REPORT.md)
- [官方技能导入报告](./docs/OFFICIAL_SKILLS_IMPORT_REPORT.md)
- [开发者指南](./AGENTS.md)
