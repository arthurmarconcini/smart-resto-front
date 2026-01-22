import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/Login'
import { RegisterPage } from '@/pages/auth/Register'
import { DashboardPage } from '@/pages/app/Dashboard'
import { SettingsPage } from '@/pages/app/Settings'
import { ProductsPage } from '@/pages/products/ProductsPage'
import { FinancePage } from '@/pages/finance/FinancePage'
import { SalesPage } from '@/pages/sales/SalesPage'
import { WelcomePage } from '@/pages/Welcome'
import { PrivateRoute, PublicRoute } from '@/components/RouteGuards'
import { Toaster } from "@/components/ui/sonner"
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/store/auth-store'

function App() {
  const { user, company, token, refreshProfile } = useAuth()

  useEffect(() => {
    if (token && (!user || !company)) {
      refreshProfile()
    }
  }, [token, user, company, refreshProfile])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/products" element={<ProductsPage />} />
            <Route path="/dashboard/sales" element={<SalesPage />} />
            <Route path="/dashboard/expenses" element={<FinancePage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
