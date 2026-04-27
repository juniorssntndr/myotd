import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { Product } from "@/types"

interface FavoritesState {
  favorites: Product[]
  hydrated: boolean
  setHydrated: (hydrated: boolean) => void
  addFavorite: (product: Product) => void
  removeFavorite: (productId: string) => void
  toggleFavorite: (product: Product) => void
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      hydrated: false,

      setHydrated: (hydrated) => set({ hydrated }),

      addFavorite: (product) => {
        set((state) => {
          if (state.favorites.some((favorite) => favorite.id === product.id)) {
            return state
          }

          return {
            favorites: [product, ...state.favorites],
          }
        })
      },

      removeFavorite: (productId) => {
        set((state) => ({
          favorites: state.favorites.filter((favorite) => favorite.id !== productId),
        }))
      },

      toggleFavorite: (product) => {
        if (get().isFavorite(product.id)) {
          get().removeFavorite(product.id)
          return
        }

        get().addFavorite(product)
      },

      isFavorite: (productId) => {
        return get().favorites.some((favorite) => favorite.id === productId)
      },

      clearFavorites: () => {
        set({ favorites: [] })
      },
    }),
    {
      name: "myotd-favorites",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
