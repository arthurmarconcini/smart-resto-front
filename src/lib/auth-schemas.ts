import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  companyName: z.string().min(2, "O nome da empresa é obrigatório"),
  password: z.string()
    .min(8, "A senha deve ter no mínimo 8 dígitos")
    .regex(/[A-Za-z]/, "Deve conter pelo menos uma letra")
    .regex(/\d/, "Deve conter pelo menos um número"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;

