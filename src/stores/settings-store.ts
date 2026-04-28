import { create } from "zustand"

import {
  type HomeVisualSettings,
  defaultHomeVisual,
  sanitizeHomeVisual,
} from "@/lib/home-visual"

export interface GeneralSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeDescription: string
  timezone: string
  currency: string
}

export interface SocialLinks {
  facebook: string
  twitter: string
  instagram: string
  youtube: string
  tiktok: string
}

export interface StoreConfig {
  showOutOfStock: boolean
  showStockQuantity: boolean
  allowReviews: boolean
  standardShippingCost: number
  freeShippingThreshold: number
}

export interface NotificationSettings {
  newOrders: boolean
  failedPayments: boolean
  lowStock: boolean
  newUsers: boolean
}

export interface PaymentMethods {
  card: boolean
  transfer: boolean
  wallet: boolean
  cashOnDelivery: boolean
}

interface SettingsState {
  general: GeneralSettings
  socialLinks: SocialLinks
  storeConfig: StoreConfig
  notifications: NotificationSettings
  paymentMethods: PaymentMethods
  homeVisual: HomeVisualSettings
  loading: boolean
  error: string | null
  updateGeneral: (config: Partial<GeneralSettings>) => void
  updateSocialLinks: (links: SocialLinks) => void
  updateStoreConfig: (config: Partial<StoreConfig>) => void
  updateNotifications: (config: Partial<NotificationSettings>) => void
  updatePaymentMethods: (config: Partial<PaymentMethods>) => void
  updateHomeVisual: (config: HomeVisualSettings) => void
  fetchSettings: (silent?: boolean) => Promise<void>
  saveSettings: () => Promise<void>
}

const defaultGeneral: GeneralSettings = {
  storeName: "Myotd",
  storeEmail: "info@myotd.pe",
  storePhone: "+51 999 888 777",
  storeAddress: "Av. Lima 123, Lima",
  storeDescription: "Moda urbana multimarca para Perú",
  timezone: "america-lima",
  currency: "pen",
}

const defaultSocialLinks: SocialLinks = {
  facebook: "",
  twitter: "",
  instagram: "",
  youtube: "",
  tiktok: "",
}

const defaultStoreConfig: StoreConfig = {
  showOutOfStock: true,
  showStockQuantity: true,
  allowReviews: true,
  standardShippingCost: 15,
  freeShippingThreshold: 200,
}

const defaultNotifications: NotificationSettings = {
  newOrders: true,
  failedPayments: true,
  lowStock: true,
  newUsers: true,
}

const defaultPaymentMethods: PaymentMethods = {
  card: true,
  transfer: true,
  wallet: true,
  cashOnDelivery: true,
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  general: defaultGeneral,
  socialLinks: defaultSocialLinks,
  storeConfig: defaultStoreConfig,
  notifications: defaultNotifications,
  paymentMethods: defaultPaymentMethods,
  homeVisual: defaultHomeVisual,
  loading: true,
  error: null,

  updateGeneral: (config) =>
    set((state) => ({
      general: { ...state.general, ...config },
    })),
  updateSocialLinks: (links) => set({ socialLinks: links }),
  updateStoreConfig: (config) =>
    set((state) => ({
      storeConfig: { ...state.storeConfig, ...config },
    })),
  updateNotifications: (config) =>
    set((state) => ({
      notifications: { ...state.notifications, ...config },
    })),
  updatePaymentMethods: (config) =>
    set((state) => ({
      paymentMethods: { ...state.paymentMethods, ...config },
    })),
  updateHomeVisual: (config) => set({ homeVisual: sanitizeHomeVisual(config) }),

  fetchSettings: async (silent = false) => {
    if (!silent) {
      set({ loading: true, error: null })
    }

    try {
      const response = await fetch("/api/settings", { cache: "no-store" })
      if (!response.ok) throw new Error("Error fetching settings")

      const data = await response.json()

      set({
        general: {
          storeName: data.storeName || defaultGeneral.storeName,
          storeEmail: data.storeEmail || defaultGeneral.storeEmail,
          storePhone: data.storePhone || defaultGeneral.storePhone,
          storeAddress: data.storeAddress || defaultGeneral.storeAddress,
          storeDescription: data.storeDescription || defaultGeneral.storeDescription,
          timezone: data.timezone || defaultGeneral.timezone,
          currency: data.currency || defaultGeneral.currency,
        },
        socialLinks: {
          facebook: data.facebook || defaultSocialLinks.facebook,
          twitter: data.twitter || defaultSocialLinks.twitter,
          instagram: data.instagram || defaultSocialLinks.instagram,
          youtube: data.youtube || defaultSocialLinks.youtube,
          tiktok: data.tiktok || defaultSocialLinks.tiktok,
        },
        storeConfig: {
          showOutOfStock: data.showOutOfStock,
          showStockQuantity: data.showStockQuantity,
          allowReviews: data.allowReviews,
          standardShippingCost: Number(data.standardShippingCost),
          freeShippingThreshold: Number(data.freeShippingThreshold),
        },
        notifications: {
          newOrders: data.notifyNewOrders,
          failedPayments: data.notifyFailedPayments,
          lowStock: data.notifyLowStock,
          newUsers: data.notifyNewUsers,
        },
        paymentMethods: {
          card: data.payCard,
          transfer: data.payTransfer,
          wallet: data.payWallet,
          cashOnDelivery: data.payCashOnDelivery,
        },
        homeVisual: sanitizeHomeVisual(data.homeVisual ?? defaultHomeVisual),
        loading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  saveSettings: async () => {
    const state = get()
    const payload = {
      ...state.general,
      ...state.socialLinks,
      ...state.storeConfig,
      notifyNewOrders: state.notifications.newOrders,
      notifyFailedPayments: state.notifications.failedPayments,
      notifyLowStock: state.notifications.lowStock,
      notifyNewUsers: state.notifications.newUsers,
      payCard: state.paymentMethods.card,
      payTransfer: state.paymentMethods.transfer,
      payWallet: state.paymentMethods.wallet,
      payCashOnDelivery: state.paymentMethods.cashOnDelivery,
      homeVisual: sanitizeHomeVisual(state.homeVisual),
    }

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Error saving settings")

      await get().fetchSettings(true)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },
}))
