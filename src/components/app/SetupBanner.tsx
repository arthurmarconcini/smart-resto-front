import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth-store";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export function SetupBanner() {
  const { isCompanyConfigured } = useAuth();

  if (isCompanyConfigured()) {
    return null;
  }

  return (
    <Alert variant="warning" className="mb-6 bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-900/30">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold">Configuração Pendente</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span>
          Sua configuração financeira está incompleta. Configure seus custos fixos e margem de lucro para obter cálculos precisos.
        </span>
        <Link to="/dashboard/settings">
          <Button variant="outline" size="sm" className="bg-white/50 border-yellow-300 hover:bg-white text-yellow-900 dark:bg-transparent dark:border-yellow-200/30 dark:text-yellow-200 dark:hover:bg-yellow-900/40 whitespace-nowrap">
            Configurar Agora
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
