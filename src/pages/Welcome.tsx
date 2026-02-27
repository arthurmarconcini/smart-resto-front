import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, LayoutDashboard, TrendingUp, Scissors } from "lucide-react";

export function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden transition-colors">
      {/* Header/Nav */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-border/50">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          SmartResto
        </h1>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Acessar Painel
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-medium shadow-sm">
              Começar Grátis
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12 mt-10 md:mt-20">
        <div className="space-y-6 max-w-4xl animate-in fade-in zoom-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border text-sm text-muted-foreground font-medium mb-4">
            <span className="flex h-2 w-2 rounded-full bg-success"></span>
            O Sistema Definitivo para Empreendedores da Gastronomia
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold text-foreground tracking-tight leading-[1.1]">
            Pare de perder dinheiro e assuma o controle do seu{" "}
            <span className="text-primary relative inline-block">
              Restaurante
              <div className="absolute -bottom-2 left-0 w-full h-2 bg-primary/20 rounded-full" />
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Da ficha técnica ao DRE simplificado. Descubra o ponto de equilíbrio exato do seu negócio, precifique seus pratos com inteligência (Markup Real) e acabe com os custos ocultos.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-14 rounded-full text-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                Quero Lucrar Mais
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted h-14 rounded-full text-lg px-8 transition-all">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-6xl grid md:grid-cols-3 gap-6 pt-20 pb-24">
          <Card className="border-l-4 border-l-primary shadow-sm hover:-translate-y-1 transition-transform duration-300 bg-card">
            <CardHeader className="space-y-4 pb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-display text-card-foreground">Precificação Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Esqueça o "multiplicar por 3". Cadastre seus insumos, configure sua ficha técnica e descubra o Markup ideal para garantir margem real de lucro em cada prato vendido.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive shadow-sm hover:-translate-y-1 transition-transform duration-300 bg-card">
            <CardHeader className="space-y-4 pb-2">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl font-display text-card-foreground">Corte de Custos Invisíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Lance suas despesas fixas, variáveis e folha de pagamento. Nosso painel processa todos os seus custos e entrega uma visão crua de para onde o seu dinheiro está indo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success shadow-sm hover:-translate-y-1 transition-transform duration-300 bg-card">
            <CardHeader className="space-y-4 pb-2">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-xl font-display text-card-foreground">DRE & Ponto de Equilíbrio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Saiba exatamente quanto você precisa faturar para não ficar no vermelho. Um DRE visual, simplificado e direto ao ponto focado na saúde do seu fluxo de caixa.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border bg-muted/20">
        <p>© {new Date().getFullYear()} SmartResto. Feito para crescer o seu negócio.</p>
      </footer>
    </div>
  );
}
