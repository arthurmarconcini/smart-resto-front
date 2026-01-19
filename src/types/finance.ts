export enum ExpenseCategory {
  FIXED = "FIXED",      // Custos Fixos (Aluguel)
  VARIABLE = "VARIABLE",// Variáveis (Insumos)
  DEBT = "DEBT",        // Dívidas
  INVESTMENT = "INVESTMENT", // Equipamentos
  TAX = "TAX"           // Impostos Extras
}

export enum ExpenseStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export interface Expense {
  id: string
  description: string
  amount: number
  dueDate: string
  paidAt: string | null
  status: ExpenseStatus
  category: ExpenseCategory
  companyId: string
  isRecurring: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseInput {
  description: string
  amount: number
  dueDate: string | Date
  paidAt?: string | Date | null
  status?: ExpenseStatus
  category: ExpenseCategory
  isRecurring?: boolean
  installments?: number
  intervalDays?: number
}

export interface UpdateExpenseInput {
  description?: string
  amount?: number
  dueDate?: string | Date
  paidAt?: string | Date | null
  status?: ExpenseStatus
  category?: ExpenseCategory
  isRecurring?: boolean
}

export interface FinanceForecast {
  summary: {
    fixedCost: number
    variableExpenses: number
    totalDebts: number
    targetProfit: number
  }
  targets: {
    breakEvenRevenue: number
    goalRevenue: number
    dailyTarget: number
  }
}

export interface ExpenseFilters {
  month?: number
  year?: number
  status?: ExpenseStatus
}
