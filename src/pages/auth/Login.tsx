import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "@/lib/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth-store";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      const response = await api.post("/auth/sign-in", data);
      
      const { token, user } = response.data;
      
      // Update global store (which also persists to localStorage)
      setToken(token);
      if (user) {
        setUser(user);
      }
      
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao entrar", {
        description: "Credenciais inválidas. Verifique seu e-mail e senha.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Aceder ao Dashboard</CardTitle>
          <CardDescription>
            Faça login para acompanhar suas vendas em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            <p className="text-slate-500">
              Não tem conta?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Registar empresa
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
