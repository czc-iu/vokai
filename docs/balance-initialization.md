# 老用户余额初始化和余额检查功能

## 功能说明

### 1. 老用户余额初始化

给没有余额记录的老用户批量添加 10000 tokens 余额。

#### 执行方式

**方式1：通过 API 调用（推荐）**

```bash
# 1. 登录管理员账户
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"taoliang@wangji.ltd","password":"your-password"}'

# 2. 使用返回的 token 调用初始化接口
curl -X POST http://localhost:3000/api/admin/init-balances \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**返回示例：**
```json
{
  "success": true,
  "data": {
    "message": "余额初始化完成",
    "usersWithoutBalance": 5,
    "totalUsers": 10,
    "users": [
      {
        "id": 1,
        "email": "user1@example.com",
        "name": "User 1",
        "balance": 10000,
        "total_purchased": 10000,
        "total_consumed": 0
      }
    ]
  }
}
```

**方式2：手动执行 SQL**

```bash
# 连接数据库
mysql -u root -p tomybot

# 执行以下 SQL
-- 为没有余额记录的用户创建余额
INSERT INTO token_balances (user_id, balance, total_purchased, total_consumed, created_at, updated_at)
SELECT 
    u.id,
    10000,
    10000,
    0,
    NOW(),
    NOW()
FROM users u
LEFT JOIN token_balances tb ON u.id = tb.user_id
WHERE tb.id IS NULL;

-- 添加交易记录
INSERT INTO token_transactions (user_id, type, amount, balance_after, description, reference_type, reference_id, created_at)
SELECT 
    u.id,
    'gift',
    10000,
    10000,
    '系统赠送',
    'welcome_bonus_legacy',
    u.id,
    NOW()
FROM users u
INNER JOIN token_balances tb ON u.id = tb.user_id
WHERE tb.total_purchased = 10000
AND tb.balance = 10000
AND NOT EXISTS (
    SELECT 1 FROM token_transactions tt 
    WHERE tt.user_id = u.id 
    AND tt.type = 'gift' 
    AND tt.description = '系统赠送'
);
```

### 2. 余额检查功能

当用户余额 <= 0 时，禁止发送对话消息。

#### 实现位置

**前端检查（chat.vue）：**
```typescript
const sendMessage = async () => {
  // ... 其他检查 ...
  
  // 检查余额
  if (tokenBalance.value <= 0) {
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: '⚠️ 当前tokens余额不足，请充值后继续使用。',
      created_at: new Date().toISOString()
    })
    return
  }
  
  // ... 发送消息 ...
}
```

**后端检查（stream.post.ts）：**
```typescript
export default defineEventHandler(async (event) => {
  // ... 认证检查 ...
  
  // 检查用户余额
  const balance = await getBalance(userId)
  if (balance <= 0) {
    throw createError({
      statusCode: 402,
      message: '当前tokens余额不足，请充值后继续使用'
    })
  }
  
  // ... 处理对话 ...
})
```

### 3. 管理员权限

目前管理员邮箱硬编码在 `server/api/admin/init-balances.post.ts` 中：

```typescript
const adminEmails = ['taoliang@wangji.ltd', 'admin@example.com']
```

如需添加更多管理员，修改此数组。

## 测试验证

### 1. 测试余额初始化

```bash
# 登录管理员
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"taoliang@wangji.ltd","password":"your-password"}' | jq -r '.data.token')

# 初始化余额
curl -X POST http://localhost:3000/api/admin/init-balances \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 2. 测试余额检查

**场景1：余额充足**
```bash
# 登录用户（余额 > 0）
# 发送消息 - 应该成功
```

**场景2：余额不足**
```bash
# 登录用户（余额 <= 0）
# 发送消息 - 应该显示错误提示
```

### 3. 验证数据

```sql
-- 查看所有用户余额
SELECT 
    u.id,
    u.email,
    u.name,
    COALESCE(tb.balance, 0) as balance,
    COALESCE(tb.total_purchased, 0) as total_purchased,
    COALESCE(tb.total_consumed, 0) as total_consumed
FROM users u
LEFT JOIN token_balances tb ON u.id = tb.user_id
ORDER BY u.id;

-- 查看赠送交易记录
SELECT 
    u.email,
    tt.type,
    tt.amount,
    tt.description,
    tt.created_at
FROM token_transactions tt
JOIN users u ON tt.user_id = u.id
WHERE tt.type = 'gift'
ORDER BY tt.created_at DESC;
```

## 注意事项

1. **安全性**
   - 只有管理员可以调用初始化接口
   - 不会重复赠送（有去重检查）

2. **性能**
   - 批量操作，性能良好
   - 使用事务保证数据一致性（MySQL 默认自动提交）

3. **兼容性**
   - 不影响已有余额的用户
   - 新用户注册自动赠送（通过 getOrCreateBalance）

4. **错误处理**
   - 前端和后端双重检查
   - 友好的错误提示

## 后续优化建议

1. **添加管理员表**
   - 创建 `admins` 表管理管理员权限
   - 支持角色和权限管理

2. **余额预警**
   - 余额低于某个阈值时提醒用户
   - 发送邮件或站内通知

3. **充值引导**
   - 余额不足时显示充值链接
   - 推荐合适的充值套餐

4. **数据统计**
   - 统计余额分布
   - 分析充值和消费模式
