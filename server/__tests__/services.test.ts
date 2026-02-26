import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockQuery = vi.fn()
const mockQueryOne = vi.fn()
const mockInsert = vi.fn()
const mockRemove = vi.fn()

vi.mock('../utils/db', () => ({
  query: mockQuery,
  queryOne: mockQueryOne,
  insert: mockInsert,
  remove: mockRemove
}))

vi.stubGlobal('useRuntimeConfig', () => ({}))

describe('Services Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAllServices', () => {
    it('should return all active services by default', async () => {
      const mockServices = [
        { id: 1, name: 'Basic', price: 100, features: '["Feature 1"]', is_active: true, sort_order: 1 },
        { id: 2, name: 'Pro', price: 200, features: '["Feature 1", "Feature 2"]', is_active: true, sort_order: 2 }
      ]
      mockQuery.mockResolvedValue(mockServices)

      const { getAllServices } = await import('../utils/services')
      const result = await getAllServices()

      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE is_active = TRUE'))
      expect(result).toHaveLength(2)
      expect(result[0].features).toEqual(['Feature 1'])
    })

    it('should return all services including inactive when activeOnly is false', async () => {
      const mockServices = [
        { id: 1, name: 'Active', is_active: true, features: null },
        { id: 2, name: 'Inactive', is_active: false, features: null }
      ]
      mockQuery.mockResolvedValue(mockServices)

      const { getAllServices } = await import('../utils/services')
      const result = await getAllServices(false)

      expect(mockQuery).toHaveBeenCalledWith(expect.not.stringContaining('WHERE is_active'))
      expect(result).toHaveLength(2)
    })

    it('should order services by sort_order', async () => {
      mockQuery.mockResolvedValue([])

      const { getAllServices } = await import('../utils/services')
      await getAllServices()

      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('ORDER BY sort_order'))
    })

    it('should handle null features', async () => {
      const mockServices = [
        { id: 1, name: 'Basic', features: null, is_active: true, sort_order: 1 }
      ]
      mockQuery.mockResolvedValue(mockServices)

      const { getAllServices } = await import('../utils/services')
      const result = await getAllServices()

      expect(result[0].features).toBeNull()
    })

    it('should handle array features', async () => {
      const mockServices = [
        { id: 1, name: 'Basic', features: ['A', 'B'], is_active: true, sort_order: 1 }
      ]
      mockQuery.mockResolvedValue(mockServices)

      const { getAllServices } = await import('../utils/services')
      const result = await getAllServices()

      expect(result[0].features).toEqual(['A', 'B'])
    })

    it('should handle invalid JSON features', async () => {
      const mockServices = [
        { id: 1, name: 'Basic', features: 'invalid json', is_active: true, sort_order: 1 }
      ]
      mockQuery.mockResolvedValue(mockServices)

      const { getAllServices } = await import('../utils/services')
      const result = await getAllServices()

      expect(result[0].features).toBeNull()
    })

    it('should handle non-array parsed features', async () => {
      const mockServices = [
        { id: 1, name: 'Basic', features: '{"key": "value"}', is_active: true, sort_order: 1 }
      ]
      mockQuery.mockResolvedValue(mockServices)

      const { getAllServices } = await import('../utils/services')
      const result = await getAllServices()

      expect(result[0].features).toBeNull()
    })

    it('should return empty array when no services', async () => {
      mockQuery.mockResolvedValue([])

      const { getAllServices } = await import('../utils/services')
      const result = await getAllServices()

      expect(result).toEqual([])
    })
  })

  describe('getService', () => {
    it('should return service by id', async () => {
      const mockService = {
        id: 1,
        name: 'Basic',
        price: 100,
        features: '["Feature 1"]',
        is_active: true
      }
      mockQueryOne.mockResolvedValue(mockService)

      const { getService } = await import('../utils/services')
      const result = await getService(1)

      expect(mockQueryOne).toHaveBeenCalledWith(
        'SELECT * FROM services WHERE id = ?',
        [1]
      )
      expect(result?.name).toBe('Basic')
      expect(result?.features).toEqual(['Feature 1'])
    })

    it('should return null when service not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getService } = await import('../utils/services')
      const result = await getService(999)

      expect(result).toBeNull()
    })
  })

  describe('getCartItems', () => {
    it('should return cart items with service details', async () => {
      const mockItems = [
        {
          id: 1,
          user_id: 1,
          service_id: 1,
          quantity: 2,
          name: 'Basic',
          tokens: 100,
          price: 50,
          original_price: 60,
          features: '["F1"]',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
      mockQuery.mockResolvedValue(mockItems)

      const { getCartItems } = await import('../utils/services')
      const result = await getCartItems(1)

      expect(result).toHaveLength(1)
      expect(result[0].service?.name).toBe('Basic')
      expect(result[0].service?.tokens).toBe(100)
      expect(result[0].quantity).toBe(2)
    })

    it('should handle empty cart', async () => {
      mockQuery.mockResolvedValue([])

      const { getCartItems } = await import('../utils/services')
      const result = await getCartItems(1)

      expect(result).toEqual([])
    })

    it('should order items by created_at DESC', async () => {
      mockQuery.mockResolvedValue([])

      const { getCartItems } = await import('../utils/services')
      await getCartItems(1)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY c.created_at DESC'),
        [1]
      )
    })
  })

  describe('getCartCount', () => {
    it('should return cart item count', async () => {
      mockQueryOne.mockResolvedValue({ count: 3 })

      const { getCartCount } = await import('../utils/services')
      const result = await getCartCount(1)

      expect(result).toBe(3)
    })

    it('should return 0 when cart is empty', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getCartCount } = await import('../utils/services')
      const result = await getCartCount(1)

      expect(result).toBe(0)
    })
  })

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      mockQueryOne.mockResolvedValueOnce(null)
      mockInsert.mockResolvedValue({ insertId: 1 })
      mockQueryOne.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        service_id: 2,
        quantity: 1
      })

      const { addToCart } = await import('../utils/services')
      const result = await addToCart(1, 2)

      expect(mockInsert).toHaveBeenCalledWith('cart_items', {
        user_id: 1,
        service_id: 2,
        quantity: 1
      })
      expect(result.service_id).toBe(2)
    })

    it('should increment quantity for existing item', async () => {
      mockQueryOne.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        service_id: 2,
        quantity: 1
      })
      mockQuery.mockResolvedValue({ affectedRows: 1 })
      mockQueryOne.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        service_id: 2,
        quantity: 3
      })

      const { addToCart } = await import('../utils/services')
      const result = await addToCart(1, 2, 2)

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE cart_items SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?',
        [2, 1]
      )
      expect(result.quantity).toBe(3)
    })

    it('should use default quantity of 1', async () => {
      mockQueryOne.mockResolvedValueOnce(null)
      mockInsert.mockResolvedValue({ insertId: 1 })
      mockQueryOne.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        service_id: 2,
        quantity: 1
      })

      const { addToCart } = await import('../utils/services')
      await addToCart(1, 2)

      expect(mockInsert).toHaveBeenCalledWith('cart_items', {
        user_id: 1,
        service_id: 2,
        quantity: 1
      })
    })
  })

  describe('updateCartItemQuantity', () => {
    it('should update quantity', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { updateCartItemQuantity } = await import('../utils/services')
      const result = await updateCartItemQuantity(1, 1, 5)

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
        [5, 1, 1]
      )
      expect(result).toBe(true)
    })

    it('should return false when item not found', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 0 })

      const { updateCartItemQuantity } = await import('../utils/services')
      const result = await updateCartItemQuantity(1, 999, 5)

      expect(result).toBe(false)
    })

    it('should remove item when quantity is 0 or less', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 1 })

      const { updateCartItemQuantity } = await import('../utils/services')
      const result = await updateCartItemQuantity(1, 1, 0)

      expect(mockRemove).toHaveBeenCalledWith(
        'cart_items',
        'id = ? AND user_id = ?',
        [1, 1]
      )
      expect(result).toBe(true)
    })

    it('should remove item when quantity is negative', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 1 })

      const { updateCartItemQuantity } = await import('../utils/services')
      await updateCartItemQuantity(1, 1, -1)

      expect(mockRemove).toHaveBeenCalled()
    })
  })

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 1 })

      const { removeFromCart } = await import('../utils/services')
      const result = await removeFromCart(1, 1)

      expect(mockRemove).toHaveBeenCalledWith(
        'cart_items',
        'id = ? AND user_id = ?',
        [1, 1]
      )
      expect(result).toBe(true)
    })

    it('should return false when item not found', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 0 })

      const { removeFromCart } = await import('../utils/services')
      const result = await removeFromCart(1, 999)

      expect(result).toBe(false)
    })
  })

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 3 })

      const { clearCart } = await import('../utils/services')
      await clearCart(1)

      expect(mockRemove).toHaveBeenCalledWith(
        'cart_items',
        'user_id = ?',
        [1]
      )
    })
  })

  describe('getCartTotal', () => {
    it('should calculate cart total correctly', async () => {
      const mockItems = [
        {
          id: 1,
          user_id: 1,
          service_id: 1,
          quantity: 2,
          name: 'Basic',
          tokens: 100,
          price: 50,
          original_price: 60,
          features: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          user_id: 1,
          service_id: 2,
          quantity: 1,
          name: 'Pro',
          tokens: 200,
          price: 100,
          original_price: null,
          features: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
      mockQuery.mockResolvedValue(mockItems)

      const { getCartTotal } = await import('../utils/services')
      const result = await getCartTotal(1)

      expect(result.totalAmount).toBe(200)
      expect(result.totalTokens).toBe(400)
      expect(result.totalQuantity).toBe(3)
      expect(result.items).toHaveLength(2)
    })

    it('should return zeros for empty cart', async () => {
      mockQuery.mockResolvedValue([])

      const { getCartTotal } = await import('../utils/services')
      const result = await getCartTotal(1)

      expect(result.totalAmount).toBe(0)
      expect(result.totalTokens).toBe(0)
      expect(result.totalQuantity).toBe(0)
      expect(result.items).toEqual([])
    })

    it('should handle items without service', async () => {
      const mockItems = [
        {
          id: 1,
          user_id: 1,
          service_id: 1,
          quantity: 2,
          name: 'Basic',
          tokens: 100,
          price: 50,
          original_price: null,
          features: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
      mockQuery.mockResolvedValue(mockItems)

      const { getCartTotal } = await import('../utils/services')
      const result = await getCartTotal(1)

      expect(result.totalAmount).toBe(100)
      expect(result.totalTokens).toBe(200)
    })

    it('should handle string price values', async () => {
      const mockItems = [
        {
          id: 1,
          user_id: 1,
          service_id: 1,
          quantity: 2,
          name: 'Basic',
          tokens: 100,
          price: '50.50',
          original_price: null,
          features: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
      mockQuery.mockResolvedValue(mockItems)

      const { getCartTotal } = await import('../utils/services')
      const result = await getCartTotal(1)

      expect(result.totalAmount).toBe(101)
    })
  })
})
