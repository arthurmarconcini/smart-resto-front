import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Receipt, Salad, Settings, LogOut, Menu, ChefHat, Wallet, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SetupBanner } from "@/components/app/SetupBanner";

const sidebarItems = [
  {
    title: "Resumo",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Vendas",
    icon: ShoppingBag,
    href: "/dashboard/sales",
  },
  {
    title: "Produtos",
    icon: Salad,
    href: "/dashboard/products",
  },
  {
    title: "Despesas",
    icon: Receipt,
    href: "/dashboard/expenses",
  },
  {
    title: "Configurações",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

interface SidebarContentProps {
  pathname: string;
  onLinkClick?: () => void;
}

function SidebarContent({ pathname, onLinkClick }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="flex items-center gap-2 p-6">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <ChefHat className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold font-heading text-sidebar-foreground">
          Smart Resto
        </span>
      </div>
      <div className="flex-1 py-4 px-3 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
              pathname === item.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-md shadow-yellow-500/20"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
           <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
             <Wallet className="h-4 w-4 text-primary" />
           </div>
           <div>
             <p className="text-xs text-muted-foreground">Plano Atual</p>
             <p className="text-sm font-semibold text-primary">Pro</p>
           </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const { user, logout, isCompanyConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If authenticated, has user data, but company is not configured
    if (user && !isCompanyConfigured()) {
      // Allow user to be on the settings page
      if (location.pathname !== "/dashboard/settings") {
        toast.warning("Por favor, finalize a configuração da sua conta.");
        navigate("/dashboard/settings");
      }
    }
  }, [user, isCompanyConfigured, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-border">
        <SidebarContent pathname={location.pathname} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="px-4 md:px-6 pt-4">
          <SetupBanner />
        </div>
        
        {/* Header */}
        <header className="h-16 border-b border-border bg-background px-4 md:px-6 flex items-center justify-between">
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r-0">
                <SidebarContent pathname={location.pathname} onLinkClick={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1" /> {/* Spacer */}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right mr-3">
                <p className="text-sm font-medium text-foreground leading-none">
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {user?.email}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 border border-border">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff`} />
                       <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
