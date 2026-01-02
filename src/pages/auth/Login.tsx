import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "@/lib/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const navigate = useNavigate();

  const onSubmit = async (data: LoginSchema) => {
    try {
      const response = await api.post("/auth/sign-in", data);
      localStorage.setItem("token", response.data.token); // Guardar o JWT
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Credenciais inválidas");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 max-w-md mx-auto border rounded-xl shadow-sm mt-20 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Aceder ao Dashboard</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input {...register("email")} type="email" placeholder="E-mail" className="dark:bg-slate-800 dark:text-white" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
        </div>
        <div>
          <Input {...register("password")} type="password" placeholder="Senha" className="dark:bg-slate-800 dark:text-white" />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message as string}</p>}
        </div>
        <Button type="submit" className="w-full">Entrar</Button>
      </form>
    </div>
  );
}
