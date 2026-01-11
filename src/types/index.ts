export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  monthlyFixedCost?: number;
  defaultTaxRate?: number;
  defaultCardFee?: number;
  desiredProfit?: number;
  targetProfitValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: 'ADMIN' | 'MANAGER' | 'WAITER' | 'KITCHEN'; // Assuming roles
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  dueDate?: string;
  status?: 'PAID' | 'PENDING';
  categoryId?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Revenue {
  id: string;
  month: string; // "YYYY-MM"
  totalRevenue: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}
