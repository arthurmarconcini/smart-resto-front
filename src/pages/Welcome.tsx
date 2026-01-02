import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, LayoutDashboard, TrendingUp } from "lucide-react";

export function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
      {/* Header/Nav */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          Smart Resto
        </h1>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
              Entrar
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
              Começar Agora
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12 mt-10 md:mt-20">
        <div className="space-y-6 max-w-3xl animate-in fade-in zoom-in duration-700">
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Transforme Custos em{" "}
            <span className="bg-linear-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
              Lucro Real
            </span>
            <br />
            com Markup Divisor
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Deixe de adivinhar o preço dos seus pratos. Nossa inteligência financeira ajuda você a calcular o preço ideal, gerir despesas e maximizar a margem de cada venda.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-14 rounded-full text-lg shadow-lg shadow-blue-500/25 transition-all hover:scale-105">
                Começar Agora
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 h-14 rounded-full text-lg px-8">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-6xl grid md:grid-cols-3 gap-6 pt-16 pb-20">
          <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Calculator className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">Cálculo de Markup Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Defina o preço de venda perfeito com base nos custos reais e na margem desejada, sem suposições.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">Gestão de Despesas e Dívidas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Controle todas as saídas e saiba exatamente para onde o dinheiro está indo. Mantenha as contas em dia.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">Relatórios de Lucratividade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Visualize o crescimento do seu negócio com gráficos claros e relatórios detalhados de performance.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-slate-500 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 Smart Resto. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
