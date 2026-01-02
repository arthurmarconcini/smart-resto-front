import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterSchema } from "@/lib/auth-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      // Omitimos o confirmPassword usando desestruturação
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = data;
      await api.post("/auth/sign-up", payload);
      alert("Conta criada com sucesso! Faça login.");
    } catch (error) {
      console.error("Erro ao registar:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 max-w-md mx-auto border rounded-xl shadow-sm mt-20 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Criar conta no Smart Restô</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Nome Completo</Label>
          <Input {...register("name")} placeholder="Seu nome" className="dark:bg-slate-800 dark:text-white" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Nome do Restaurante</Label>
          <Input {...register("companyName")} placeholder="Ex: Cantina do Arthur" className="dark:bg-slate-800 dark:text-white" />
          {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">E-mail</Label>
          <Input {...register("email")} type="email" placeholder="email@exemplo.com" className="dark:bg-slate-800 dark:text-white" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Senha</Label>
          <Input {...register("password")} type="password" className="dark:bg-slate-800 dark:text-white" />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Confirmar Senha</Label>
          <Input {...register("confirmPassword")} type="password" className="dark:bg-slate-800 dark:text-white" />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message as string}</p>}
        </div>

        <Button type="submit" className="w-full">Registar Empresa</Button>
      </form>
    </div>
  );
}
