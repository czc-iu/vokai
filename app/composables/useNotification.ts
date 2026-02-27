export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  createdAt: Date
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  const add = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      duration: notification.duration ?? 5000
    }
    
    notifications.value.push(newNotification)
    
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, newNotification.duration)
    }
    
    return id
  }
  
  const remove = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clear = () => {
    notifications.value = []
  }
  
  const info = (title: string, message: string, duration?: number) => {
    return add({ type: 'info', title, message, duration })
  }
  
  const success = (title: string, message: string, duration?: number) => {
    return add({ type: 'success', title, message, duration })
  }
  
  const warning = (title: string, message: string, duration?: number) => {
    return add({ type: 'warning', title, message, duration })
  }
  
  const error = (title: string, message: string, duration?: number) => {
    return add({ type: 'error', title, message, duration })
  }
  
  return {
    notifications: readonly(notifications),
    add,
    remove,
    clear,
    info,
    success,
    warning,
    error
  }
}
