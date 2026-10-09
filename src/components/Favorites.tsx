import { createContext, useContext, useState, type ReactNode } from 'react'
import { getProduct, type ProductCode } from '../domain/catalog'

const Context = createContext<{ favorites: ProductCode[]; toggle: (code: ProductCode) => void }>({
  favorites: [],
  toggle: () => {},
})
function load(): ProductCode[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('mekit.favorites.v1') ?? '[]')
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter((c): c is ProductCode => typeof c === 'string' && !!getProduct(c)),
          ),
        ]
      : []
  } catch {
    return []
  }
}
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<ProductCode[]>(load)
  function toggle(code: ProductCode) {
    setFavorites((previous) => {
      const next = previous.includes(code)
        ? previous.filter((c) => c !== code)
        : [...previous, code]
      try {
        localStorage.setItem('mekit.favorites.v1', JSON.stringify(next))
      } catch {
        /* The current session still works. */
      }
      return next
    })
  }
  return <Context.Provider value={{ favorites, toggle }}>{children}</Context.Provider>
}
export const useFavorites = () => useContext(Context)
