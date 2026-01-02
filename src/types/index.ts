export interface Company {
  id: string;
  name: string;
  cnpj?: string;
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
  categoryId?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}
