import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <Button variant="destructive" onClick={handleLogout}>
            Terminar Sessão
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
            Bem-vindo ao Smart Restô
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Painel de controlo do seu restaurante.
          </p>
        </div>
      </div>
    </div>
  );
}
