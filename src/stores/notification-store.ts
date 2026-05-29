import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface Notification {
  id: string
  title: string
  time: string
  read?: boolean
}

interface NotificationState {
  notifications: Notification[]
  readIds: string[]
  hydrated: boolean
  fetchNotifications: () => Promise<void>
  markAllAsRead: () => void
  setHydrated: (state: boolean) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      readIds: [],
      hydrated: false,
      fetchNotifications: async () => {
        try {
          const response = await fetch("/api/admin/notifications")
          if (!response.ok) throw new Error("Error fetching notifications")
          const data: Notification[] = await response.json()
          
          const state = get()
          const unread = data.filter((n) => !state.readIds.includes(n.id))
          set({ notifications: unread })
        } catch (error) {
          console.error("Error loading notifications:", error)
        }
      },
      markAllAsRead: () => {
        const currentIds = get().notifications.map((n) => n.id)
        set((state) => ({
          readIds: Array.from(new Set([...state.readIds, ...currentIds])),
          notifications: [],
        }))
      },
      setHydrated: (state) => set({ hydrated: state }),
    }),
    {
      name: "admin-notifications-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ readIds: state.readIds }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
