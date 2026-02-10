import { ExpenseCategory, ExpenseStatus } from "@/types/finance"
import { ProductUnit } from "@/types/product"

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.FIXED]: "Custos Fixos",
  [ExpenseCategory.VARIABLE]: "Custos Variáveis",
  [ExpenseCategory.DEBT]: "Dívidas/Empréstimos",
  [ExpenseCategory.INVESTMENT]: "Investimentos",
}

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  [ExpenseStatus.PENDING]: "Pendente",
  [ExpenseStatus.PAID]: "Pago",
}

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  [ProductUnit.UN]: "Unidade (UN)",
  [ProductUnit.KG]: "Quilo (KG)",
  [ProductUnit.L]: "Litro (L)",
  [ProductUnit.PORCAO]: "Porção",
}
