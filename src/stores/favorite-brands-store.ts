import { create } from "zustand"
import type { Brand } from "@/types"

export interface FavoriteBrand extends Brand {
  createdAt?: string
}

interface FavoriteBrandsState {
  favoriteBrands: FavoriteBrand[]
  favoriteBrandIds: string[]
  loading: boolean
  initialized: boolean
  error: string | null
  fetchFavoriteBrands: () => Promise<void>
  addFavoriteBrand: (brand: Brand) => Promise<void>
  removeFavoriteBrand: (brandId: string) => Promise<void>
  toggleFavoriteBrand: (brand: Brand) => Promise<void>
  isFavoriteBrand: (brandId: string) => boolean
}

export const useFavoriteBrandsStore = create<FavoriteBrandsState>((set, get) => ({
  favoriteBrands: [],
  favoriteBrandIds: [],
  loading: false,
  initialized: false,
  error: null,

  fetchFavoriteBrands: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/favorite-brands")

      if (response.status === 401) {
        set({ favoriteBrands: [], favoriteBrandIds: [], loading: false, initialized: true })
        return
      }

      if (!response.ok) {
        throw new Error("Error fetching favorite brands")
      }

      const favoriteBrands: FavoriteBrand[] = await response.json()

      set({
        favoriteBrands,
        favoriteBrandIds: favoriteBrands.map((brand) => brand.id),
        loading: false,
        initialized: true,
      })
    } catch (error) {
      set({ error: (error as Error).message, loading: false, initialized: true })
    }
  },

  addFavoriteBrand: async (brand) => {
    const response = await fetch("/api/favorite-brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: brand.id }),
    })

    if (response.status === 401) {
      throw new Error("AUTH_REQUIRED")
    }

    if (!response.ok) {
      throw new Error("Error creating favorite brand")
    }

    const favoriteBrand: FavoriteBrand = await response.json()

    set((state) => ({
      favoriteBrands: state.favoriteBrands.some((item) => item.id === favoriteBrand.id)
        ? state.favoriteBrands
        : [favoriteBrand, ...state.favoriteBrands],
      favoriteBrandIds: state.favoriteBrandIds.includes(favoriteBrand.id)
        ? state.favoriteBrandIds
        : [favoriteBrand.id, ...state.favoriteBrandIds],
    }))
  },

  removeFavoriteBrand: async (brandId) => {
    const response = await fetch(`/api/favorite-brands/${brandId}`, {
      method: "DELETE",
    })

    if (response.status === 401) {
      throw new Error("AUTH_REQUIRED")
    }

    if (!response.ok) {
      throw new Error("Error deleting favorite brand")
    }

    set((state) => ({
      favoriteBrands: state.favoriteBrands.filter((brand) => brand.id !== brandId),
      favoriteBrandIds: state.favoriteBrandIds.filter((id) => id !== brandId),
    }))
  },

  toggleFavoriteBrand: async (brand) => {
    if (get().isFavoriteBrand(brand.id)) {
      await get().removeFavoriteBrand(brand.id)
      return
    }

    await get().addFavoriteBrand(brand)
  },

  isFavoriteBrand: (brandId) => get().favoriteBrandIds.includes(brandId),
}))
