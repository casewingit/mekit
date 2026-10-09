import { useEffect } from 'react'
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { FavoritesProvider } from './components/Favorites'
import { Layout } from './components/Layout'
import { Home, Collections } from './pages/Home'
import { ProductPage } from './pages/Product'
import { SizeGuide } from './pages/SizeGuide'
import { Materials } from './pages/Materials'
import { Checkout } from './pages/Checkout'
import { Orders, OrderDetail } from './pages/Orders'
import { Support, Policy } from './pages/Support'
import { NotFound } from './pages/NotFound'
const Router = import.meta.env.MODE === 'pages' ? HashRouter : BrowserRouter
function RouteEffects() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    document.title = 'MEKIT — Make it your own'
    if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView())
    else {
      window.scrollTo(0, 0)
      document.getElementById('main-content')?.focus({ preventScroll: true })
    }
  }, [pathname, hash])
  return null
}
export function App() {
  return (
    <Router>
      <FavoritesProvider>
        <RouteEffects />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Collections standalone />} />
            <Route path="products/:code" element={<ProductPage />} />
            <Route path="size-guide" element={<SizeGuide />} />
            <Route path="materials" element={<Materials />} />
            <Route path="favorites" element={<Collections standalone favoritesOnly />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="support" element={<Support />} />
            <Route path="policies/:type" element={<Policy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </FavoritesProvider>
    </Router>
  )
}
