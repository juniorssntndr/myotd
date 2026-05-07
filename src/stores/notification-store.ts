import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface Notification {
  id: number
  title: string
  time: string
  read?: boolean
}

interface NotificationState {
  notifications: Notification[]
  hydrated: boolean
  setNotifications: (notifications: Notification[]) => void
  markAllAsRead: () => void
  setHydrated: (state: boolean) => void
}

const initialNotifications: Notification[] = [
  { id: 1, title: "Nuevo pedido #1024", time: "Hace 5 minutos" },
  { id: 2, title: "Nuevo usuario registrado", time: "Hace 2 horas" },
  { id: 3, title: "Stock bajo: Nike Air Force 1", time: "Hace 5 horas" },
]

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: initialNotifications,
      hydrated: false,
      setNotifications: (notifications) => set({ notifications }),
      markAllAsRead: () => {
        set({ notifications: [] });
      },
      setHydrated: (state) => set({ hydrated: state }),
    }),
    {
      name: "admin-notifications-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notifications: state.notifications }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
