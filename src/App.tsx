import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/Login'
import { RegisterPage } from '@/pages/auth/Register'
import { DashboardPage } from '@/pages/app/Dashboard'

function Welcome() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
            Smart Resto
          </h1>
          <p className="text-xl text-slate-400 max-w-lg mx-auto">
            The intelligent solution for modern restaurant management.
          </p>
        </div>

        <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm shadow-xl space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Welcome aboard</h2>
          <p className="text-slate-300 mb-8">
            Please log in or register your restaurant to continue.
          </p>
          <div className="flex gap-4 justify-center">
             <Link to="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
               Login
             </Link>
             <Link to="/register" className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
               Register
             </Link>
          </div>
        </div>

        <footer className="text-sm text-slate-500 mt-12">
          <p>System Ready • v0.1.0</p>
        </footer>
      </div>
    </div>
  )
}



import { PrivateRoute, PublicRoute } from '@/components/RouteGuards'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
