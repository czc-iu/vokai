<template>
  <div class="notification-container fixed top-20 right-4 z-50 space-y-2 max-w-sm">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item bg-white rounded-lg shadow-lg border overflow-hidden"
        :class="notificationClass(notification.type)"
      >
        <div class="p-4">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <Icon :name="iconName(notification.type)" class="w-5 h-5" :class="iconClass(notification.type)" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
            </div>
            <button
              @click="remove(notification.id)"
              class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { notifications, remove } = useNotification()

const notificationClass = (type: string) => {
  const classes = {
    info: 'border-blue-200',
    success: 'border-green-200',
    warning: 'border-orange-200',
    error: 'border-red-200'
  }
  return classes[type as keyof typeof classes] || 'border-gray-200'
}

const iconName = (type: string) => {
  const icons = {
    info: 'heroicons:information-circle',
    success: 'heroicons:check-circle',
    warning: 'heroicons:exclamation-triangle',
    error: 'heroicons:x-circle'
  }
  return icons[type as keyof typeof icons] || 'heroicons:information-circle'
}

const iconClass = (type: string) => {
  const classes = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-orange-600',
    error: 'text-red-600'
  }
  return classes[type as keyof typeof classes] || 'text-gray-600'
}
</script>

<style scoped>
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.2s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
