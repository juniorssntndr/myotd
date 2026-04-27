import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Category } from "@/types"

interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  addCategory: (data: { name: string; slug: string; icon?: string }) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  removeCategory: (id: string) => void
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set) => ({
      categories: [],
      loading: false,
      error: null,

      fetchCategories: async () => {
        set({ loading: true, error: null })
        try {
          const response = await fetch("/api/categories")
          if (!response.ok) throw new Error("Error fetching categories")
          const data = await response.json()
          set({ categories: data, loading: false })
        } catch (error) {
          set({ error: (error as Error).message, loading: false })
        }
      },

      addCategory: ({ name, slug, icon = "" }) => {
        const newCategory: Category = {
          id: `cat-${Date.now()}`,
          name,
          slug,
          icon,
          productCount: 0,
        }
        set((state) => ({
          categories: [...state.categories, newCategory],
        }))
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }))
      },

      removeCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }))
      },
    }),
    {
      name: "categories-storage",
      partialize: (state) => ({ categories: state.categories }),
    }
  )
)