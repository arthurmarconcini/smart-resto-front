import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetupBanner } from "@/components/app/SetupBanner";
export function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <SetupBanner />
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Smart Restô</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Painel de controle do seu restaurante.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

