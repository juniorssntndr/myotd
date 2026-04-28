import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Brand } from "@/types"

interface BrandsState {
  brands: Brand[]
  loading: boolean
  error: string | null
  fetchBrands: () => Promise<void>
  addBrand: (data: { name: string; slug: string }) => void
  updateBrand: (id: string, brand: Partial<Omit<Brand, "id">>) => void
  removeBrand: (id: string) => void
}

export const useBrandsStore = create<BrandsState>()(
  persist(
    (set) => ({
      brands: [],
      loading: false,
      error: null,

      fetchBrands: async () => {
        set({ loading: true, error: null })
        try {
          const response = await fetch("/api/brands")
          if (!response.ok) throw new Error("Error fetching brands")
          const data = await response.json()
          set({ brands: data, loading: false })
        } catch (error) {
          set({ error: (error as Error).message, loading: false })
        }
      },

      addBrand: ({ name, slug }) => {
        const newBrand: Brand = {
          id: `brand-${Date.now()}`,
          name,
          slug,
          productCount: 0,
        }
        set((state) => ({
          brands: [...state.brands, newBrand],
        }))
      },

      updateBrand: (id, brand) => {
        set((state) => ({
          brands: state.brands.map((b) =>
            b.id === id ? { ...b, ...brand } : b
          ),
        }))
      },

      removeBrand: (id) => {
        set((state) => ({
          brands: state.brands.filter((b) => b.id !== id),
        }))
      },
    }),
    {
      name: "brands-storage",
      onRehydrateStorage: () => (state) => {
        if (state) void state.fetchBrands()
      },
    }
  )
)