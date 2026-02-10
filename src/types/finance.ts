export enum ExpenseCategory {
  FIXED = "FIXED",
  VARIABLE = "VARIABLE",
  DEBT = "DEBT",
  INVESTMENT = "INVESTMENT",
}

export enum ExpenseStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: ExpenseStatus;
  category: ExpenseCategory;
  companyId: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateExpenseInput {
  description: string;
  amount: number;
  dueDate: string | Date;
  paidAt?: string | Date | null;
  status?: ExpenseStatus;
  category: ExpenseCategory;
  isRecurring?: boolean;
  installments?: number;
  intervalDays?: number;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  dueDate?: string | Date;
  paidAt?: string | Date | null;
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  isRecurring?: boolean;
}

export interface EmployeeBreakdownItem {
  id: string;
  name: string;
  role: string;
  workedDays: number;
  dailyRate: number;
  monthlyCost: number;
}

export interface FixedCostsBreakdown {
  manualCosts: number;
  employeeCosts: number;
  employees: EmployeeBreakdownItem[];
}

export interface FinanceForecast {
  breakDown: {
    genericFixedCost: number;
    detailedFixedCost: number;
    totalEmployeeCost: number;
    totalFixedCost: number;
    variableExpenses: number;
    targetProfit: number;
  };
  fixedCostsBreakdown: FixedCostsBreakdown;
  targets: {
    breakEvenRevenue: number;
    goalRevenue: number;
    dailyTarget: number;
  };
  summary: {
    fixedCost: number;
    variableExpenses: number;
    totalDebts: number;
    targetProfit: number;
  };
  currentStats?: {
    totalRevenue: number;
  };
}

export interface ExpenseFilters {
  month?: number;
  year?: number;
  status?: ExpenseStatus;
}
