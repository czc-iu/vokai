import { query, queryOne, insert, remove } from './db'

export interface Service {
  id: number
  name: string
  description: string | null
  tokens: number
  price: number
  original_price: number | null
  validity_days: number | null
  features: string[] | null
  is_popular: boolean
  is_active: boolean
  sort_order: number
  created_at: Date
  updated_at: Date
}

export interface CartItem {
  id: number
  user_id: number
  service_id: number
  quantity: number
  service?: Service
  created_at: Date
  updated_at: Date
}

interface CartItemRow {
  id: number
  user_id: number
  service_id: number
  quantity: number
  name: string
  tokens: number
  price: number
  original_price: number | null
  features: string | null
  created_at: Date
  updated_at: Date
}

function parseFeatures(features: unknown): string[] | null {
  if (!features) return null
  if (Array.isArray(features)) return features as string[]
  if (typeof features !== 'string') return null

  try {
    const parsed = JSON.parse(features)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function mapServiceWithFeatures(service: Service): Service {
  return {
    ...service,
    features: parseFeatures(service.features)
  }
}

function mapServicesWithFeatures(services: Service[]): Service[] {
  return services.map(mapServiceWithFeatures)
}

function buildServiceFromCartItem(row: CartItemRow): Service {
  return {
    id: row.service_id,
    name: row.name,
    tokens: row.tokens,
    price: row.price,
    original_price: row.original_price,
    features: parseFeatures(row.features),
    is_popular: false,
    is_active: true,
    sort_order: 0,
    description: null,
    validity_days: null,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

function mapCartItemRowToCartItem(row: CartItemRow): CartItem {
  return {
    id: row.id,
    user_id: row.user_id,
    service_id: row.service_id,
    quantity: row.quantity,
    created_at: row.created_at,
    updated_at: row.updated_at,
    service: buildServiceFromCartItem(row)
  }
}

export async function getAllServices(activeOnly = true): Promise<Service[]> {
  let sql = 'SELECT * FROM services'
  if (activeOnly) {
    sql += " WHERE is_active = TRUE"
  }
  sql += ' ORDER BY sort_order ASC, id ASC'

  const services = await query<Service[]>(sql)
  return mapServicesWithFeatures(services)
}

export async function getService(id: number): Promise<Service | null> {
  const service = await queryOne<Service>(
    'SELECT * FROM services WHERE id = ?',
    [id]
  )

  if (!service) return null

  return mapServiceWithFeatures(service)
}

export async function getCartItems(userId: number): Promise<CartItem[]> {
  const items = await query<CartItemRow[]>(
    `SELECT c.*, s.name, s.tokens, s.price, s.original_price, s.features
     FROM cart_items c
     JOIN services s ON c.service_id = s.id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC`,
    [userId]
  )

  return items.map(mapCartItemRowToCartItem)
}

export async function getCartCount(userId: number): Promise<number> {
  const result = await queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
    [userId]
  )
  return result?.count ?? 0
}

async function findExistingCartItem(
  userId: number,
  serviceId: number
): Promise<CartItem | null> {
  return queryOne<CartItem>(
    'SELECT * FROM cart_items WHERE user_id = ? AND service_id = ?',
    [userId, serviceId]
  )
}

async function incrementCartItemQuantity(itemId: number, quantity: number): Promise<void> {
  await query(
    'UPDATE cart_items SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?',
    [quantity, itemId]
  )
}

async function createNewCartItem(
  userId: number,
  serviceId: number,
  quantity: number
): Promise<number> {
  const result = await insert('cart_items', {
    user_id: userId,
    service_id: serviceId,
    quantity
  })
  return result.insertId
}

async function fetchCartItemById(itemId: number): Promise<CartItem | null> {
  return queryOne<CartItem>('SELECT * FROM cart_items WHERE id = ?', [itemId])
}

export async function addToCart(
  userId: number,
  serviceId: number,
  quantity = 1
): Promise<CartItem> {
  const existing = await findExistingCartItem(userId, serviceId)

  if (existing) {
    await incrementCartItemQuantity(existing.id, quantity)
    return (await fetchCartItemById(existing.id))!
  }

  await createNewCartItem(userId, serviceId, quantity)
  const newItemId = await createNewCartItem(userId, serviceId, quantity)

  return (await fetchCartItemById(newItemId))!
}

export async function updateCartItemQuantity(
  userId: number,
  itemId: number,
  quantity: number
): Promise<boolean> {
  if (quantity <= 0) {
    return removeFromCart(userId, itemId)
  }

  const result = await query(
    'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
    [quantity, itemId, userId]
  )

  return (result as unknown as { affectedRows: number }).affectedRows > 0
}

export async function removeFromCart(
  userId: number,
  itemId: number
): Promise<boolean> {
  const result = await remove(
    'cart_items',
    'id = ? AND user_id = ?',
    [itemId, userId]
  )
  return result.affectedRows > 0
}

export async function clearCart(userId: number): Promise<void> {
  await remove('cart_items', 'user_id = ?', [userId])
}

interface CartTotals {
  items: CartItem[]
  totalAmount: number
  totalTokens: number
  totalQuantity: number
}

function calculateCartTotals(items: CartItem[]): CartTotals {
  const totals = items.reduce(
    (acc, item) => {
      if (!item.service) return acc

      return {
        totalAmount: acc.totalAmount + Number(item.service.price) * item.quantity,
        totalTokens: acc.totalTokens + item.service.tokens * item.quantity,
        totalQuantity: acc.totalQuantity + item.quantity
      }
    },
    { totalAmount: 0, totalTokens: 0, totalQuantity: 0 }
  )

  return { items, ...totals }
}

export async function getCartTotal(userId: number): Promise<CartTotals> {
  const items = await getCartItems(userId)
  return calculateCartTotals(items)
}
